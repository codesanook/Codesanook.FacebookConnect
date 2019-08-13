using Orchard.Environment;
using React;

namespace Codesanok.FacebookConnect {
    public class ShellEvent : IOrchardShellEvents {
        public void Activated() {
            ReactSiteConfiguration.Configuration
                .SetLoadBabel(false)
                .AddScriptWithoutTransform("~/modules/codesanook.facebookconnect/scripts/facebook-connect.js");
        }

        public void Terminating() {
        }
    }
}