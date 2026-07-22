interface UserAvatarProps {
  name: string;
  image?: string;
}

export default function UserAvatar({
  name,
  image,
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-10 w-10 rounded-full object-cover border-2 border-blue-700"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
      {initials}
    </div>
  );
}