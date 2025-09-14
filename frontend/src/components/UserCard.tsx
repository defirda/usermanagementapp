export default function UserCard({ name, email }: { name: string; email: string }) {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-lg font-semibold">{name}</h2>
      <p>{email}</p>
    </div>
  );
}
