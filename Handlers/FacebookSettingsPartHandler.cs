using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Orchard.ContentManagement.Handlers;
using Orchard.Data;
using CodeSanook.FacebookConnect.Models;

namespace CodeSanook.FacebookConnect.Handlers
{
    public class FacebookSettingsPartHandler : ContentHandler
    {
        public FacebookSettingsPartHandler(IRepository<FacebookConnectSettingsPartRecord> repository)
        {
            Filters.Add(new ActivatingFilter<FacebookConnectSettingsPart>("Site"));
            Filters.Add(StorageFilter.For(repository));
        }

    }
}