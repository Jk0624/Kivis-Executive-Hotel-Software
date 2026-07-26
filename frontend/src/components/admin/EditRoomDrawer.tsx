import { useEffect, useState } from "react";

import LoadingButton from "../common/LoadingButton";
import api from "../../services/api";
import { notify } from "../../utils/notify";

type EditRoomDrawerProps = {
  isOpen: boolean;
  roomId: string | null;
  onClose: () => void;
  onUpdated: () => void;
};

function EditRoomDrawer({
  isOpen,
  roomId,
  onClose,
  onUpdated,
}: EditRoomDrawerProps) {
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

  const [existingPhotos, setExistingPhotos] =
    useState<string[]>([]);

  const [
    existingPhotoPublicIds,
    setExistingPhotoPublicIds,
  ] = useState<string[]>([]);

  const [fetchingRoom, setFetchingRoom] =
    useState(false);

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [updatingRoom, setUpdatingRoom] =
    useState(false);

  const [roomNoError, setRoomNoError] =
    useState("");

  const [typeError, setTypeError] =
    useState("");

  const [priceError, setPriceError] =
    useState("");

  const [
    descriptionError,
    setDescriptionError,
  ] = useState("");

  const [
    amenitiesError,
    setAmenitiesError,
  ] = useState("");

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
    setExistingPhotos([]);
    setExistingPhotoPublicIds([]);

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
      setPriceError("Nightly rate is required.");
      valid = false;
    } else if (
      Number(formData.price) <= 0 ||
      Number.isNaN(Number(formData.price))
    ) {
      setPriceError(
        "Nightly rate must be greater than zero."
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
        "Please provide at least one amenity."
      );
      valid = false;
    }

    if (
      existingPhotos.length +
        selectedImages.length ===
      0
    ) {
      setImagesError(
        "Please keep or upload at least one room image."
      );
      valid = false;
    }

    if (
      existingPhotos.length +
        selectedImages.length >
      8
    ) {
      setImagesError(
        "A maximum of 8 room images is allowed."
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

  const fetchRoom = async () => {
    if (!roomId) return;

    setFetchingRoom(true);

    try {
      const response = await api.get(
        `/admin/rooms/${roomId}`
      );

      const room = response.data.room;

      setExistingPhotos(room.photos || []);
      setExistingPhotoPublicIds(
        room.photoPublicIds || []
      );
      setImagePreviews(room.photos || []);

      setSelectedImages([]);

      setFormData({
        roomNo: room.roomNo,
        type: room.type,
        description: room.description || "",
        price: room.price.toString(),
        amenities:
          room.amenities.join(", "),
      });
    } catch (error: any) {
      console.error(error);

      notify.error(
        error.response?.data?.message ??
          "Failed to load room details."
      );
    } finally {
      setFetchingRoom(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!validateForm()) {
      notify.error(
        "Please correct the highlighted fields."
      );
      return;
    }

    setUpdatingRoom(true);

    const loadingToast = notify.loading(
      "Updating room..."
    );

    try {
      const uploaded =
        await uploadImages();

      await api.patch(
        `/admin/rooms/${roomId}`,
        {
          roomNo:
            formData.roomNo.trim(),
          type: formData.type,
          description:
            formData.description.trim(),
          amenities: formData.amenities
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),
          photos: [
            ...existingPhotos,
            ...uploaded.photos,
          ],
          photoPublicIds: [
            ...existingPhotoPublicIds,
            ...uploaded.photoPublicIds,
          ],
          price: Number(
            formData.price
          ),
        }
      );

      notify.dismiss(
        loadingToast
      );

      notify.success(
        "Room updated successfully."
      );

      onUpdated();
      onClose();
    } catch (error: any) {
      notify.dismiss(
        loadingToast
      );

      console.error(error);

      notify.error(
        error.response?.data?.message ??
          "Failed to update room."
      );
    } finally {
      setUpdatingRoom(false);
    }
  };

  useEffect(() => {
    if (isOpen && roomId) {
      fetchRoom();
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  return ( 
        <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          if (
            !uploadingImages &&
            !updatingRoom &&
            !fetchingRoom
          ) {
            onClose();
          }
        }}
      />

      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Edit Room
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update room information and images.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              fetchingRoom ||
              uploadingImages ||
              updatingRoom
            }
            className="text-3xl font-light text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {fetchingRoom ? (
            <div className="flex h-80 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="text-sm text-slate-500">
                  Loading room details...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
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
                  disabled={
                    uploadingImages ||
                    updatingRoom
                  }
                  aria-invalid={!!roomNoError}
                  aria-describedby={
                    roomNoError
                      ? "room-number-error"
                      : undefined
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
                  disabled={
                    uploadingImages ||
                    updatingRoom
                  }
                  aria-invalid={!!typeError}
                  aria-describedby={
                    typeError
                      ? "room-type-error"
                      : undefined
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
                  disabled={
                    uploadingImages ||
                    updatingRoom
                  }
                  aria-invalid={!!priceError}
                  aria-describedby={
                    priceError
                      ? "room-price-error"
                      : undefined
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
                  disabled={
                    uploadingImages ||
                    updatingRoom
                  }
                  aria-invalid={
                    !!descriptionError
                  }
                  aria-describedby={
                    descriptionError
                      ? "room-description-error"
                      : undefined
                  }
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      description:
                        e.target.value,
                    });

                    if (
                      descriptionError
                    ) {
                      setDescriptionError(
                        ""
                      );
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
                  disabled={
                    uploadingImages ||
                    updatingRoom
                  }
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
                  disabled={
                    uploadingImages ||
                    updatingRoom
                  }
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

                    if (!files.length) {
                      return;
                    }

                    if (
                      existingPhotos.length +
                        selectedImages.length +
                        files.length >
                      8
                    ) {
                      setImagesError(
                        "A maximum of 8 room images is allowed."
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
                      Room Images
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {imagePreviews.length}/8 Images
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {imagePreviews.map(
                      (preview, index) => (
                        <div
                          key={`${preview}-${index}`}
                          className="group relative overflow-hidden rounded-xl border border-slate-200"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${
                              index + 1
                            }`}
                            className="h-32 w-full object-cover"
                          />

                          <button
                            type="button"
                            disabled={
                              uploadingImages ||
                              updatingRoom
                            }
                            onClick={() => {
                              if (
                                index <
                                existingPhotos.length
                              ) {
                                setExistingPhotos(
                                  (prev) =>
                                    prev.filter(
                                      (_, i) =>
                                        i !== index
                                    )
                                );

                                setExistingPhotoPublicIds(
                                  (prev) =>
                                    prev.filter(
                                      (_, i) =>
                                        i !== index
                                    )
                                );
                              } else {
                                const newIndex =
                                  index -
                                  existingPhotos.length;

                                setSelectedImages(
                                  (prev) =>
                                    prev.filter(
                                      (_, i) =>
                                        i !==
                                        newIndex
                                    )
                                );

                                URL.revokeObjectURL(
                                  preview
                                );
                              }

                              setImagePreviews(
                                (prev) =>
                                  prev.filter(
                                    (_, i) =>
                                      i !== index
                                  )
                              );
                            }}
                            className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
                  <p className="font-medium text-slate-600">
                    No room images available.
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Upload images to display them here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={
              fetchingRoom ||
              uploadingImages ||
              updatingRoom
            }
            className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <LoadingButton
            type="button"
            onClick={handleUpdateRoom}
            loading={
              uploadingImages ||
              updatingRoom
            }
            loadingText={
              uploadingImages
                ? "Uploading Images..."
                : "Updating Room..."
            }
            className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Update Room
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

export default EditRoomDrawer;