using Orchard.ContentManagement.Drivers;
using Orchard.UI.Notify;
using Orchard.Security;
using Orchard;
using Orchard.Localization;
using Orchard.ContentManagement;
using CodeSanook.FacebookConnect.Models;

namespace CodeSanook.FacebookConnect.Drivers
{
    public class FacebookSettingsPartDriver : ContentPartDriver<FacebookConnectSettingsPart>
    {
        public FacebookSettingsPartDriver(
            INotifier notifier,
            IAuthorizationService authorizationService,
            IAuthenticationService authenticationService,
            IOrchardServices services)
        {
            this.notifier = notifier;
            this.authorizationService = authorizationService;
            this.authenticationService = authenticationService;
            this.services = services;
            T = NullLocalizer.Instance;
        }

        public Localizer T { get; set; }

        private const string TemplateName = "Parts/Facebook.Settings";
        private readonly INotifier notifier;
        private readonly IAuthorizationService authorizationService;
        private readonly IAuthenticationService authenticationService;
        private readonly IOrchardServices services;

        protected override DriverResult Editor(FacebookConnectSettingsPart part, dynamic shapeHelper)
        {
            if (!authorizationService.TryCheckAccess(Permissions.EditSettings, 
                authenticationService.GetAuthenticatedUser(), part))
                return null;

            return ContentShape("Parts_Facebook_Settings",
                    () => shapeHelper
                    .EditorTemplate(TemplateName: TemplateName, Model: part, Prefix: Prefix));
        }

        protected override DriverResult Editor(FacebookConnectSettingsPart part, IUpdateModel updater, dynamic shapeHelper)
        {
            if (!authorizationService
                .TryCheckAccess(Permissions.EditSettings, authenticationService.GetAuthenticatedUser(), part))
                return null;

            if (updater.TryUpdateModel(part, Prefix, null, null))
            {
                notifier.Information(T("Facebook Settings Saved"));
            }
            else
            {
                notifier.Error(T("Error during facebook settings update!"));
            }
            return Editor(part, shapeHelper);
        }
    }
}