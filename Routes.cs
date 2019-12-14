using System.Collections.Generic;
using System.Web.Mvc;
using System.Web.Routing;
using Orchard.Mvc.Routes;

namespace Codesanook.FacebookConnect {
    public class Routes : IRouteProvider {

        public void GetRoutes(ICollection<RouteDescriptor> routes) {

            foreach (var routeDescriptor in GetRoutes()) {
                routes.Add(routeDescriptor);
            }
        }

        public IEnumerable<RouteDescriptor> GetRoutes() {
            return new[] {
                //Override existing action method
                new RouteDescriptor {
                    Name = "LogInWithFacebook",
                    Priority = 100,
                    Route = new Route(
                        "users/account/logon",
                        new RouteValueDictionary {
                            {"area", "Codesanook.FacebookConnect"},
                            {"controller", "Facebook"},
                            {"action", "Connect"}
                        },
                        new RouteValueDictionary(),
                        new RouteValueDictionary {
                            {"area", "Codesanook.FacebookConnect"}
                        },
                        new MvcRouteHandler())
                },

                // Make friendly URL 
                new RouteDescriptor {
                    Priority = 100,
                    Route = new Route(
                        "facebook/connect",
                        new RouteValueDictionary {
                            {"area", "Codesanook.FacebookConnect"},
                            {"controller", "Facebook"},
                            {"action", "Connect"}
                        },
                        new RouteValueDictionary(),
                        new RouteValueDictionary {
                            {"area", "Codesanook.FacebookConnect"}
                        },
                        new MvcRouteHandler())
                }
            };
        }
    }
}