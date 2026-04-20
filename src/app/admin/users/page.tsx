import { listAdminUsers } from "@/lib/actions/admin-users";
import UsersManager from "./UsersManager";

export default async function AdminUsersPage() {
  const users = await listAdminUsers();
  return <UsersManager initialUsers={users} />;
}
