using Orchard.UI.Resources;

namespace Codesanook.FacebookConnect {
    public class ResourceRegistration: IResourceManifestProvider  {
        public void BuildManifests(ResourceManifestBuilder builder) {
            var manifest = builder.Add();
            //manifest.DefineScript("AngularJs").SetUrl("angular.min.js", "angular.js")
            //    .SetVersion(angularVersion);



        }
    }
}