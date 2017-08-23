using System;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using Orchard;
using Facebook;
using Orchard.ContentManagement;
using Orchard.Security;
using Orchard.Users.Events;
using Orchard.Users.Models;
using Orchard.Mvc.Extensions;
using Orchard.Logging;
using Orchard.Localization;
using Orchard.Mvc;
using Orchard.Themes;
using System.IO;
using System.Text.RegularExpressions;
using System.Net;
using Amazon.S3;
using Amazon.S3.Model;
using System.Threading.Tasks;
using CodeSanook.FacebookConnect.Models;
using CodeSanook.Configuration.Models;
using url = Flurl.Url;

namespace CodeSanook.FacebookConnect.Controllers
{
    [HandleError, Themed]
    public class FacebookController : Controller
    {
        private readonly IOrchardServices orchardService;
        private readonly IAuthenticationService auth;
        private readonly IMembershipService membershipService;
        private readonly IUserEventHandler userEventHandler;
        private ModuleSettingPart settings;
        private IContentManager contentManager;

        //property injection
        public ILogger Logger { get; set; }
        public Localizer T { get; set; }

        public FacebookController(
            IOrchardServices orchardService,
            IAuthenticationService auth,
            IMembershipService membershipService,
            IUserEventHandler userEventHandler,
            IContentManager contentManager)
        {
            this.orchardService = orchardService;
            this.auth = auth;
            this.membershipService = membershipService;
            this.userEventHandler = userEventHandler;
            this.contentManager = contentManager;

            Logger = NullLogger.Instance;
            T = NullLocalizer.Instance;

            // Acquire Facebook settings
            settings = orchardService.WorkContext.CurrentSite.As<ModuleSettingPart>();
        }

        [AlwaysAccessible]
        public ActionResult Connect(string returnUrl)
        {
            if (auth.GetAuthenticatedUser() != null)
                return this.RedirectLocal(returnUrl);

            var shape = orchardService.New.FacebookLogIn(Title: T("Log On").Text, ReturnUrl: returnUrl);
            return new ShapeResult(this, shape);
        }

        [AlwaysAccessible]
        [HttpPost]
        public async Task<ActionResult> Connect(FacebookLogInRequest request, FormCollection form)
        {
            //todo better error response to client to show why we have error
            ValidateAccessToken(request);

            // If already logged in update the account info
            var user = auth.GetAuthenticatedUser();
            if (user == null)
            {
                //If user does not log in and create if user does not exist in database
                user = orchardService.ContentManager.Query<UserPart, UserPartRecord>()
                   .Where<UserPartRecord>(x => x.Email == request.Email)
                   .List<IUser>()
                   .SingleOrDefault();

                if (user == null)
                {
                    var userParam = new CreateUserParams(
                        request.FirstName,
                        GeneratePassword(8),
                        request.Email,
                        null, null, true);
                    user = membershipService.CreateUser(userParam);
                }
            }

            //always update profile
            user = await UpdateFacebookUserPart(request, user);
            //sign in
            auth.SignIn(user, true);

            //update last log in, to make cookie valid
            userEventHandler.LoggedIn(user);
            return new JsonResult();
        }

        private async Task<IUser> UpdateFacebookUserPart(FacebookLogInRequest request, IUser user)
        {
            var newUser = contentManager.New("User");
            var part = newUser.As<FacebookUserPart>();


            //update UserPart  
            var userPart = user.ContentItem.As<UserPart>();
            userPart.UserName = request.FirstName;
            userPart.NormalizedUserName = userPart.UserName.ToLowerInvariant();

            //update user Facebook profile 
            var facebookUser = user.ContentItem.As<FacebookUserPart>();
            facebookUser.FirstName = request.FirstName;
            facebookUser.LastName = request.LastName;
            facebookUser.ProfilePictureUrl = await UploadProfileImage(request);
            var updatedUser = userPart as IUser;
            return updatedUser;
        }

        private static void ValidateAccessToken(FacebookLogInRequest request)
        {
            var client = new FacebookClient(request.FacebookAccessToken);
            //https://developers.facebook.com/tools/explorer/?method=GET&path=me%3Ffields%3Dpicture.width(200).height(200)%2Cemail&version=v2.9
            var query = "me?fields=picture.height(200).width(200),email,first_name,last_name";
            dynamic queryResult = client.Get(query);
            if (request.FacebookAppScopeUserId != Convert.ToInt64(queryResult.id) ||
                request.Email != (string)queryResult.email)
            {
                throw new InvalidOperationException("invalid Facebook access token");
            }
        }

        public static string GeneratePassword(int resetPasswordLength)
        {
            // Create an array of characters to user for password reset.
            // Exclude confusing or ambiguous characters such as 1 0 l o i
            var characters = new[] { "2", "3", "4", "5", "6", "7", "8",
                "9", "a", "b", "c", "d", "e", "f", "g", "h", "j", "k", "m", "n",
                "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"};

            var newPassword = new StringBuilder();
            var rnd = new Random();

            for (var index = 0; index < resetPasswordLength; index++)
            {
                newPassword.Append(characters[rnd.Next(characters.Length)]);
            }
            return newPassword.ToString();
        }

        private async Task<string> UploadProfileImage(FacebookLogInRequest request)
        {
            //remove query string path
            var pathWithOutQueryString = Regex.Replace(request.ProfilePictureUrl, @"\?.*", "");
            var fileExtension = Path.GetExtension(pathWithOutQueryString);

            var now = DateTime.UtcNow;
            var fileName = $"file-{now.ToString("yyyy-MM-dd-HH-mm-ss")}-{Guid.NewGuid()}{fileExtension}";
            var fileFullName = url.Combine(
                "uploaded",
                now.ToString("yyyy/MM/dd/HH"),
                fileName);

            MemoryStream memoryStream;
            using (var webClient = new WebClient())
            {
                var fileData = await webClient
                    .DownloadDataTaskAsync(request.ProfilePictureUrl);
                memoryStream = new MemoryStream(fileData);
            }

            using (var client = new AmazonS3Client(
                settings.AwsAccessKey,
                settings.AwsSecretKey,
                Amazon.RegionEndpoint.APSoutheast1))
            using (memoryStream)
            {
                var putRequest = new PutObjectRequest
                {
                    BucketName = settings.AwsS3BucketName,
                    InputStream = memoryStream,
                    StorageClass = S3StorageClass.ReducedRedundancy,
                    //todo dynamic content type
                    ContentType = "image/jpg",
                    CannedACL = S3CannedACL.PublicRead
                };

                putRequest.Metadata.Add("x-amz-meta-title", fileName);
                putRequest.Key = fileFullName;

                await client.PutObjectAsync(putRequest);
                return url.Combine(
                    settings.AwsS3PublicUrl,
                    settings.AwsS3BucketName,
                    fileFullName);
            }
        }
    }
}