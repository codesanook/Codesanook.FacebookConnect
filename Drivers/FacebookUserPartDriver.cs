using CodeSanook.FacebookConnect.Models;
using Orchard.ContentManagement;
using Orchard.ContentManagement.Drivers;

namespace Pluralsight.Movies.Drivers {
    public class FacebookUserPartDriver : ContentPartDriver<FacebookUserPart> {
         protected override string Prefix {
            get { return "FacebookUserPart"; }
        }

        protected override DriverResult Editor(FacebookUserPart part, 
            dynamic shapeHelper) {
            return ContentShape("Parts_FacebookUser",
                () => shapeHelper.EditorTemplate(
                    TemplateName: "Parts/FacebookUser",
                    Model: part,
                    Prefix: Prefix));
        }

        protected override DriverResult Editor(FacebookUserPart part, IUpdateModel updater, dynamic shapeHelper) {
            updater.TryUpdateModel(part, Prefix, null, null);
            return Editor(part, shapeHelper);
        }
    }
}