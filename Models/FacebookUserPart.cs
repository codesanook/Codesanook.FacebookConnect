using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Orchard.ContentManagement;

namespace CodeSanook.FacebookConnect.Models
{
    public class FacebookUserPart : ContentPart<FacebookUserPartRecord>
    {

        public string FirstName
        {
            get { return Record.FirstName; }
            set { Record.FirstName = value; }
        }

        public string LastName
        {
            get { return Record.LastName; }
            set { Record.LastName = value; }
        }

        public string ProfilePictureUrl
        {
            get { return Record.ProfilePictureUrl; }
            set { Record.ProfilePictureUrl = value; }
        }
    }
}