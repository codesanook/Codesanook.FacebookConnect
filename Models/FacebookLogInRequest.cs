namespace CodeSanook.FacebookConnect.Models
{
    public class FacebookLogInRequest
    {
        public string FacebookAccessToken { get; set; }
        public long FacebookAppScopeUserId { get; set; }
        public string ProfilePictureUrl { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
    }
}