import { useState } from "react";

import LoadingButton from "../common/LoadingButton";
import api from "../../services/api";
import { notify } from "../../utils/notify";

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
  const [formData, setFormData] = useState({
    roomNo: "",
    type: "",
    description: "",
    price: "",
    amenities: "",
  });

  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [creatingRoom, setCreatingRoom] =
    useState(false);

  const [roomNoError, setRoomNoError] =
    useState("");

  const [typeError, setTypeError] =
    useState("");

  const [priceError, setPriceError] =
    useState("");

  const [descriptionError, setDescriptionError] =
    useState("");

  const [amenitiesError, setAmenitiesError] =
    useState("");

  const [imagesError, setImagesError] =
    useState("");


      const resetForm = () => {
    setFormData({
      roomNo: "",
      type: "",
      description: "",
      price: "",
      amenities: "",
    });

    setSelectedImages([]);
    setImagePreviews([]);

    setRoomNoError("");
    setTypeError("");
    setPriceError("");
    setDescriptionError("");
    setAmenitiesError("");
    setImagesError("");
  };

  const validateForm = () => {
    let valid = true;

    setRoomNoError("");
    setTypeError("");
    setPriceError("");
    setDescriptionError("");
    setAmenitiesError("");
    setImagesError("");

    if (!formData.roomNo.trim()) {
      setRoomNoError("Room number is required.");
      valid = false;
    }

    if (!formData.type) {
      setTypeError("Please select a room type.");
      valid = false;
    }

    if (!formData.price.trim()) {
      setPriceError("Room price is required.");
      valid = false;
    } else if (
      Number(formData.price) <= 0 ||
      Number.isNaN(Number(formData.price))
    ) {
      setPriceError(
        "Room price must be greater than zero."
      );
      valid = false;
    }

    if (!formData.description.trim()) {
      setDescriptionError(
        "Room description is required."
      );
      valid = false;
    }

    if (!formData.amenities.trim()) {
      setAmenitiesError(
        "Please enter at least one amenity."
      );
      valid = false;
    }

    if (selectedImages.length === 0) {
      setImagesError(
        "Please upload at least one room image."
      );
      valid = false;
    }

    if (selectedImages.length > 8) {
      setImagesError(
        "You can upload a maximum of 8 images."
      );
      valid = false;
    }

    return valid;
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      return {
        photos: [],
        photoPublicIds: [],
      };
    }

    const uploadData = new FormData();

    selectedImages.forEach((image) => {
      uploadData.append("images", image);
    });

    setUploadingImages(true);

    try {
      const response = await api.post(
        "/admin/rooms/upload-images",
        uploadData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      return {
        photos: response.data.images.map(
          (image: any) => image.url
        ),
        photoPublicIds:
          response.data.images.map(
            (image: any) => image.publicId
          ),
      };
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!validateForm()) {
      notify.error(
        "Please correct the highlighted fields."
      );
      return;
    }

    setCreatingRoom(true);

    const loadingToast = notify.loading(
      "Creating room..."
    );

    try {
      const {
        photos,
        photoPublicIds,
      } = await uploadImages();

      await api.post("/admin/rooms", {
        roomNo: formData.roomNo.trim(),
        type: formData.type,
        description:
          formData.description.trim(),
        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        photos,
        photoPublicIds,
        price: Number(formData.price),
      });

      notify.dismiss(loadingToast);

      notify.success(
        "Room created successfully."
      );

      resetForm();

      onCreated();
      onClose();
    } catch (error: any) {
      notify.dismiss(loadingToast);

      console.error(error);

      notify.error(
        error.response?.data?.message ??
          "Failed to create room."
      );
    } finally {
      setCreatingRoom(false);
    }
  };

  if (!isOpen) return null;

  return (

        <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          if (!creatingRoom && !uploadingImages) {
            onClose();
          }
        }}
      />

      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Add a room
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a new room to the hotel inventory.
            </p>
          </div>

          <button
            type="button"
            disabled={creatingRoom || uploadingImages}
            onClick={onClose}
            className="text-3xl font-light text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div>
            <label
              htmlFor="room-number"
              className="mb-2 block font-semibold text-slate-700"
            >
              Room Number
            </label>

            <input
              id="room-number"
              type="text"
              autoComplete="off"
              value={formData.roomNo}
              disabled={creatingRoom || uploadingImages}
              aria-invalid={!!roomNoError}
              aria-describedby={
                roomNoError ? "room-number-error" : undefined
              }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  roomNo: e.target.value,
                });

                if (roomNoError) {
                  setRoomNoError("");
                }
              }}
              className={`w-full rounded-xl px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                roomNoError
                  ? "border border-red-500"
                  : "border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {roomNoError && (
              <p
                id="room-number-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {roomNoError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="room-type"
              className="mb-2 block font-semibold text-slate-700"
            >
              Room Type
            </label>

            <select
              id="room-type"
              value={formData.type}
              disabled={creatingRoom || uploadingImages}
              aria-invalid={!!typeError}
              aria-describedby={
                typeError ? "room-type-error" : undefined
              }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  type: e.target.value,
                });

                if (typeError) {
                  setTypeError("");
                }
              }}
              className={`w-full rounded-xl px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                typeError
                  ? "border border-red-500"
                  : "border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              }`}
            >
              <option value="">
                Select Room Type
              </option>

              <option value="STANDARD">
                Standard
              </option>

              <option value="DELUXE">
                Deluxe
              </option>

              <option value="EXECUTIVE">
                Executive
              </option>

              <option value="SUITE">
                Suite
              </option>
            </select>

            {typeError && (
              <p
                id="room-type-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {typeError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="room-price"
              className="mb-2 block font-semibold text-slate-700"
            >
              Nightly Rate (GHS)
            </label>

            <input
              id="room-price"
              type="number"
              min="0"
              value={formData.price}
              disabled={creatingRoom || uploadingImages}
              aria-invalid={!!priceError}
              aria-describedby={
                priceError ? "room-price-error" : undefined
              }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  price: e.target.value,
                });

                if (priceError) {
                  setPriceError("");
                }
              }}
              className={`w-full rounded-xl px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                priceError
                  ? "border border-red-500"
                  : "border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {priceError && (
              <p
                id="room-price-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {priceError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="room-description"
              className="mb-2 block font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="room-description"
              rows={5}
              value={formData.description}
              disabled={creatingRoom || uploadingImages}
              aria-invalid={!!descriptionError}
              aria-describedby={
                descriptionError
                  ? "room-description-error"
                  : undefined
              }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  description: e.target.value,
                });

                if (descriptionError) {
                  setDescriptionError("");
                }
              }}
              className={`w-full rounded-xl px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                descriptionError
                  ? "border border-red-500"
                  : "border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {descriptionError && (
              <p
                id="room-description-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {descriptionError}
              </p>
            )}
          </div>

                    <div>
            <label
              htmlFor="room-amenities"
              className="mb-2 block font-semibold text-slate-700"
            >
              Amenities
            </label>

            <textarea
              id="room-amenities"
              rows={4}
              value={formData.amenities}
              disabled={creatingRoom || uploadingImages}
              aria-invalid={!!amenitiesError}
              aria-describedby={
                amenitiesError
                  ? "room-amenities-error"
                  : undefined
              }
              placeholder="Wi-Fi, Air Conditioner, Smart TV, Mini Fridge..."
              onChange={(e) => {
                setFormData({
                  ...formData,
                  amenities: e.target.value,
                });

                if (amenitiesError) {
                  setAmenitiesError("");
                }
              }}
              className={`w-full rounded-xl px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                amenitiesError
                  ? "border border-red-500"
                  : "border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate amenities with commas.
            </p>

            {amenitiesError && (
              <p
                id="room-amenities-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {amenitiesError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="room-images"
              className="mb-2 block font-semibold text-slate-700"
            >
              Room Images
            </label>

            <input
              id="room-images"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              disabled={creatingRoom || uploadingImages}
              aria-invalid={!!imagesError}
              aria-describedby={
                imagesError
                  ? "room-images-error"
                  : undefined
              }
              onChange={(e) => {
                const files = Array.from(
                  e.target.files ?? []
                );

                if (files.length === 0) {
                  return;
                }

                if (
                  selectedImages.length +
                    files.length >
                  8
                ) {
                  setImagesError(
                    "You can upload a maximum of 8 images."
                  );
                  return;
                }

                const invalidFile = files.find(
                  (file) =>
                    ![
                      "image/jpeg",
                      "image/jpg",
                      "image/png",
                      "image/webp",
                    ].includes(file.type)
                );

                if (invalidFile) {
                  setImagesError(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
                  );
                  return;
                }

                setImagesError("");

                setSelectedImages((prev) => [
                  ...prev,
                  ...files,
                ]);

                const previews = files.map((file) =>
                  URL.createObjectURL(file)
                );

                setImagePreviews((prev) => [
                  ...prev,
                  ...previews,
                ]);
              }}
              className={`block w-full rounded-xl border bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${
                imagesError
                  ? "border-red-500"
                  : "border-slate-300"
              }`}
            />

            <p className="mt-2 text-xs text-slate-500">
              Upload up to 8 high-quality room images.
            </p>

            {imagesError && (
              <p
                id="room-images-error"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {imagesError}
              </p>
            )}
          </div>

                    {imagePreviews.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Selected Images
                </h3>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {imagePreviews.length}/8 Images
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={preview}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    <img
                      src={preview}
                      alt={`Room Preview ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />

                    <button
                      type="button"
                      disabled={
                        creatingRoom || uploadingImages
                      }
                      onClick={() => {
                        URL.revokeObjectURL(preview);

                        setSelectedImages((prev) =>
                          prev.filter(
                            (_, i) => i !== index
                          )
                        );

                        setImagePreviews((prev) =>
                          prev.filter(
                            (_, i) => i !== index
                          )
                        );
                      }}
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
              <p className="font-medium text-slate-600">
                No room images selected.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Upload images to preview them here before creating the room.
              </p>
            </div>
          )}
                  </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={creatingRoom || uploadingImages}
            className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <LoadingButton
            type="button"
            onClick={handleCreateRoom}
            loading={creatingRoom || uploadingImages}
            loadingText={
              uploadingImages
                ? "Uploading Images..."
                : "Creating Room..."
            }
            className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Create Room
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomDrawer;