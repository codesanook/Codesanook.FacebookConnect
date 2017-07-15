using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Orchard.ContentManagement;

namespace CodeSanook.FacebookConnect.Models
{
    public class FacebookConnectSettingsPart : ContentPart<FacebookConnectSettingsPartRecord>
    {
        public string FacebookAppId
        {
            get { return Record.FacebookAppId; }
            set { Record.FacebookAppId = value; }
        }

        public string AwsAccessKeyId
        {
            get { return Record.AwsAccessKeyId; }
            set { Record.AwsAccessKeyId = value; }
        }

        public string AwsSecretAccesskey
        {
            get { return Record.AwsSecretAccesskey; }
            set { Record.AwsSecretAccesskey = value; }
        }

        public string S3BucketName 
        {
            get { return Record.S3BucketName; }
            set { Record.S3BucketName = value; }
        }
    }
}