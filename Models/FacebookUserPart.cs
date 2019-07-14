using Orchard.ContentManagement;

namespace Codesanook.FacebookConnect.Models {
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