import api from "@/lib/api/axios";
import { ApiResponse } from "@/types";
import {
  GeneratePlanningDto,
  GeneratePlanningResponse,
  Planning,
  UpdatePlanningDto,
} from "../types";

export const generatePlanning = async (
  dto: GeneratePlanningDto
): Promise<ApiResponse<GeneratePlanningResponse>> => {
  const response = await api.post<ApiResponse<GeneratePlanningResponse>>(
    "/planning/generate",
    dto
  );
  return response.data;
};

export const getMyPlannings = async (): Promise<ApiResponse<Planning[]>> => {
  const response = await api.get<ApiResponse<Planning[]>>("/planning");
  return response.data;
};

export const getPlanningById = async (
  id: string
): Promise<ApiResponse<Planning>> => {
  const response = await api.get<ApiResponse<Planning>>(`/planning/${id}`);
  return response.data;
};

export const updatePlanning = async (
  id: string,
  dto: UpdatePlanningDto
): Promise<ApiResponse<Planning>> => {
  const response = await api.patch<ApiResponse<Planning>>(`/planning/${id}`, dto);
  return response.data;
};

export const deletePlanning = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/planning/${id}`);
  return response.data;
};
