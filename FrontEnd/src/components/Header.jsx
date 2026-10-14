export default function Header({ user, onSignOut }) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-emerald-950/10 text-emerald-950">
      <b>* NORTHSTAR</b>
      <span className="text-sm">
        {user.name}
        <button className="ml-3 bg-transparent text-emerald-700" onClick={onSignOut}>
          Sign out
        </button>
      </span>
    </header>
  );
}
