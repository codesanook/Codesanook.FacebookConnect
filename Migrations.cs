using Orchard.ContentManagement.MetaData;
using Orchard.Data.Migration;

namespace CodeSanook.FacebookConnect
{
    public class Migrations : DataMigrationImpl {

        public int Create() {

            //create table for a setting record 
            SchemaBuilder.CreateTable("FacebookConnectSettingsPartRecord",
                table => table
                .ContentPartRecord()
                .Column<string>("FacebookAppId", c => c.Unlimited())
                .Column<string>("AwsAccessKeyId", c => c.Unlimited())
                .Column<string>("AwsSecretAccesskey", c => c.Unlimited())
                .Column<string>("S3BucketName", c => c.Unlimited()));

            //create a table for FacebookUserPart record
            SchemaBuilder.CreateTable("FacebookUserPartRecord",
                table => table.ContentPartRecord()
                .Column<string>("FirstName")
                .Column<string>("LastName")
                .Column<string>("ProfilePictureUrl")
                );

            //alter User content type to attach FacebookUserPart
            ContentDefinitionManager.AlterTypeDefinition("User",
                cfg => cfg .WithPart("FacebookUserPart"));

            return 1;
        }

    }
}