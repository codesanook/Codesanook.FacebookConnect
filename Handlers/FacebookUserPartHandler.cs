using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Orchard.ContentManagement.Handlers;
using Orchard.Data;
using Codesanook.FacebookConnect.Models;

namespace Codesanook.FacebookConnect.Handlers
{
    public class FacebookUserPartHandler : ContentHandler
    {
        public FacebookUserPartHandler(IRepository<FacebookUserPartRecord> repository)
        {
            Filters.Add(StorageFilter.For(repository));
        }
    }
}