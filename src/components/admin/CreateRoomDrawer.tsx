import { useState } from "react";
import api from "../../services/api";


type CreateRoomDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

function CreateRoomDrawer({
  isOpen,
  onClose,
  onCreated,
}: CreateRoomDrawerProps) {
  if (!isOpen) return null;
  const [formData, setFormData] = useState({
  roomNo: "",
  type: "",
  description: "",
  price: "",
  amenities: "",
});

const [selectedImages, setSelectedImages] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
const [isUploading, setIsUploading] = useState(false);

const uploadImages = async () => {
  if (selectedImages.length === 0) {
    return {
      photos: [],
      photoPublicIds: [],
    };
  }

  const formData = new FormData();

  selectedImages.forEach((image) => {
    formData.append("images", image);
  });

  setIsUploading(true);

  try {
    const response = await api.post(
      "/admin/rooms/upload-images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
  photos: response.data.images.map(
    (image: any) => image.url
  ),
  photoPublicIds: response.data.images.map(
    (image: any) => image.publicId
  ),
};

  } finally {
    setIsUploading(false);
  }
};

const handleCreateRoom = async () => {
  try {
    const {
      photos,
      photoPublicIds,
    } = await uploadImages();

    await api.post("/admin/rooms", {
  roomNo: formData.roomNo,
  type: formData.type,
  description: formData.description,
  amenities: formData.amenities
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== ""),
  photos,
  photoPublicIds,
  price: Number(formData.price),
});

onCreated();
onClose();
 } catch (error: any) {
  console.error(error);

  alert(
    error.response?.data?.message ||
    "Failed to create room."
  );
}
};

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-bold">
            Add a room
          </h2>

          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">

  <div>
    <label className="mb-2 block font-semibold">
      Room Number
    </label>

    <input
      type="text"
      placeholder="Enter room number"
      value={formData.roomNo}
      onChange={(e) =>
        setFormData({
          ...formData,
          roomNo: e.target.value,
        })
      }
      className="w-full rounded-lg border border-gray-300 px-4 py-3"
    />
  </div>

  <div>
    <label className="mb-2 block font-semibold">
      Room Type
    </label>

    <select
      value={formData.type}
      onChange={(e) =>
        setFormData({
          ...formData,
          type: e.target.value,
        })
      }
      className="w-full rounded-lg border border-gray-300 px-4 py-3"
    >
      <option value="">Select Room Type</option>
      <option value="STANDARD">Standard</option>
      <option value="DELUXE">Deluxe</option>
      <option value="EXECUTIVE">Executive</option>
      <option value="SUITE">Suite</option>
    </select>
  </div>

  <div>
  <label className="mb-2 block font-semibold">
    Price (GHS)
  </label>

  <input
    type="number"
    placeholder="Enter room price"
    value={formData.price}
    onChange={(e) =>
      setFormData({
        ...formData,
        price: e.target.value,
      })
    }
    className="w-full rounded-lg border border-gray-300 px-4 py-3"
  />
</div>

<div>
  <label className="mb-2 block font-semibold">
    Description
  </label>

  <textarea
    rows={4}
    placeholder="Enter room description"
    value={formData.description}
    onChange={(e) =>
      setFormData({
        ...formData,
        description: e.target.value,
      })
    }
    className="w-full rounded-lg border border-gray-300 px-4 py-3"
  />
</div>

<div>
  <label className="mb-2 block font-semibold">
    Amenities
  </label>

  <input
    type="text"
    placeholder="WiFi, Air Conditioner, TV, Mini Bar"
    value={formData.amenities}
    onChange={(e) =>
      setFormData({
        ...formData,
        amenities: e.target.value,
      })
    }
    className="w-full rounded-lg border border-gray-300 px-4 py-3"
  />

  <p className="mt-2 text-sm text-gray-500">
    Separate multiple amenities with commas.
  </p>
</div>

<div>
  <label className="mb-2 block font-semibold">
    Room Images
  </label>

  <input
    type="file"
    multiple
    accept="image/png,image/jpeg,image/jpg,image/webp"
    onChange={(e) => {
  if (e.target.files) {
    const files = Array.from(e.target.files);

    setSelectedImages(files);

    setImagePreviews(
      files.map((file) =>
        URL.createObjectURL(file)
      )
    );
  }
}}
    className="w-full rounded-lg border border-gray-300 px-4 py-3"
  />

  <p className="mt-2 text-sm text-gray-500">
    You can select up to 8 JPG, JPEG, PNG or WEBP images.
  </p>
  {imagePreviews.length > 0 && (
  <div className="mt-4">
    <p className="mb-3 font-semibold">
      Selected Images
    </p>

    <div className="grid grid-cols-2 gap-4">
      {imagePreviews.map((preview, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg border"
        >
            <button
  type="button"
  onClick={() => {
    setSelectedImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setImagePreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }}
  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600 shadow-md transition hover:bg-red-600 hover:text-white"
>
  ×
</button>
          <img
            src={preview}
            alt={`Preview ${index + 1}`}
            className="h-32 w-full object-cover"
          />
        </div>
      ))}
    </div>
  </div>
)}
</div>

</div>
<div className="flex justify-end gap-3 border-t p-6">
  <button
    type="button"
    onClick={onClose}
    className="rounded-lg border border-gray-300 px-5 py-2 hover:bg-gray-100"
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={handleCreateRoom}
    disabled={isUploading}
    className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
  >
    {isUploading ? "Uploading..." : "Add Room"}
  </button>
</div>
      </div>
    </div>
  );
}

export default CreateRoomDrawer;