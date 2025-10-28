interface NavigationLink {
  href: string;
  label: string;
  active?: boolean;
}

const navigationLinks: NavigationLink[] = [
  { href: "/", label: "Peta" },
  { href: "/list", label: "Daftar Tambang" },
  { href: "/about", label: "Tentang" },
];

export default navigationLinks;