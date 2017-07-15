using System.Collections.Generic;
using Orchard;
using Orchard.ContentManagement;
using Orchard.Localization;
using Orchard.UI.Admin.Notification;
using Orchard.UI.Notify;
using CodeSanook.FacebookConnect.Models;

namespace CodeSanook.FacebookConnect
{
    public class MissingSettingsBanner : INotificationProvider
    {
        private readonly IOrchardServices _orchardServices;

        public MissingSettingsBanner(IOrchardServices orchardServices)
        {
            _orchardServices = orchardServices;
            T = NullLocalizer.Instance;
        }

        public Localizer T { get; set; }

        public IEnumerable<NotifyEntry> GetNotifications()
        {

            var facebookSettings = _orchardServices.WorkContext.CurrentSite.As<FacebookConnectSettingsPart>();

            if (facebookSettings == null 
                || string.IsNullOrWhiteSpace(facebookSettings.FacebookAppId)
                || string.IsNullOrWhiteSpace(facebookSettings.AwsAccessKeyId)
                || string.IsNullOrWhiteSpace(facebookSettings.AwsSecretAccesskey)
                || string.IsNullOrWhiteSpace(facebookSettings.S3BucketName))
            {
                yield return new NotifyEntry { 
                    Message =
                    T("<b>Facebook Application Settings needs to be configured.</b><br/> { Configuration || Settings || Facebook Application Settings }"),
                    Type = NotifyType.Warning
                };
            }
        }
    }
}
