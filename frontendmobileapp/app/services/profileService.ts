import axios from "axios";

export type UpdateProfileResponse = {
  message: string;
};

/**
 * Update the current user's profile when the change includes a profile image,
 * sent as multipart/form-data. JSON-only updates use the generated
 * ProfileApi.putUpdateProfile instead.
 *
 * PUT /api/profile/update_profile. Uses the configured global axios instance.
 */
export const updateProfileWithMedia = async (
  formData: FormData,
): Promise<UpdateProfileResponse> => {
  const response = await axios.put<UpdateProfileResponse>("/api/profile/update_profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
