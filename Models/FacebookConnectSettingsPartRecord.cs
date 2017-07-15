using Orchard.ContentManagement.Records;

namespace CodeSanook.FacebookConnect.Models
{
    public class FacebookConnectSettingsPartRecord : ContentPartRecord
    {
        public virtual string FacebookAppId { get; set; }
        public virtual string AwsAccessKeyId { get; set; }
        public virtual string AwsSecretAccesskey { get; set; }
        public virtual string S3BucketName { get; set; }
    }
}