import { Strapi } from "@strapi/strapi";

export async function addInitAdmin(strapi: Strapi) {
  // Check If admin Exists
  await strapi.admin.services.role.createRolesIfNoneExist();
  const superAdmin = await strapi.db
    .query("admin::user")
    .findOne({ where: { username: "admin" } });
  if (!superAdmin) {
    // Build Admin Params
    let params = {
      firstname: "admin",
      email: process.env.STRAPI_ADMIN_EMAIL,
      confirmed: true,
      isActive: true,
      blocked: false,
      password: "",
      roles: <any>"",
    };
    params.password = await strapi.admin.services.auth.hashPassword(
      process.env.STRAPI_ADMIN_PASSWORD
    );
    const superAdminRole = await strapi.db
      .query("admin::role")
      .findOne({ where: { code: "strapi-super-admin" } });
    params.roles = [superAdminRole.id];

    // Add To Db
    try {
      await strapi.db!.query("admin::user").create({ data: { ...params } });
      strapi.log.info(
        `Created admin (E-Mail: ${params.email}, Password: ${
          params.password ? "[INIT_ADMIN_PASSWORD]" : "admin"
        }).`
      );
    } catch (e) {
      strapi.log.error(`Couldn't create admin (${params.email}):`, e);
    }
  }
}
