const authors = [
  { name: "Areeb", href: "https://x.com/areebkhan280" },
  { name: "Sujay", href: "https://www.linkedin.com/in/sujay-mehta/" },
];

export default function Credit() {
  return (
    <p className="p-7 text-gray-600">
      Created by{" "}
      {authors.map((a, i) => (
        <span key={a.name}>
          {i > 0 && " and "}
          <a href={a.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
            {a.name}
          </a>
        </span>
      ))}
    </p>
  );
}
