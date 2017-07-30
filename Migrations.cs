using Orchard.ContentManagement.MetaData;
using Orchard.Data.Migration;

namespace CodeSanook.FacebookConnect
{
    public class Migrations : DataMigrationImpl {

        public int Create() {

            //create a table for FacebookUserPart record
            SchemaBuilder.CreateTable("FacebookUserPartRecord",
                table => table.ContentPartRecord()
                .Column<string>("FirstName")
                .Column<string>("LastName")
                .Column<string>("ProfilePictureUrl")
                );
            return 1;
        }

    }
}