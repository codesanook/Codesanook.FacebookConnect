using Orchard.ContentManagement.Records;

namespace CodeSanook.FacebookConnect.Models
{
    public class FacebookUserPartRecord : ContentPartRecord
    {
        //don't forget to set virtual
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual string ProfilePictureUrl{ get; set; }
    }
}