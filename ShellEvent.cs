using Orchard.Environment;
using React;

namespace Codesanok.FacebookConnect {
    public class ShellEvent : IOrchardShellEvents {
        public void Activated() {
            ReactSiteConfiguration.Configuration
                .SetLoadBabel(false)
                .AddScriptWithoutTransform("~/modules/codesanook.facebookconnect/scripts/main-bundle.js");
        }

        public void Terminating() {
        }
    }
}