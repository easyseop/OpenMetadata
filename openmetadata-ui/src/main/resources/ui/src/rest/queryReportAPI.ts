/*
 *  Copyright 2024 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { AxiosResponse } from 'axios';
import { Operation } from 'fast-json-patch';
import { PagingResponse, RestoreRequestType } from 'Models';
import { QueryVote as VoteType } from '../components/Database/TableQueries/TableQueries.interface';
import { APPLICATION_JSON_CONTENT_TYPE_HEADER } from '../constants/constants';
import { CreateQueryReport } from '../generated/api/data/createQueryReport';
import {
  EntityReference,
  QueryReport,
} from '../generated/entity/data/queryReport';
import { EntityHistory } from '../generated/type/entityHistory';
import { ListParams } from '../interface/API.interface';
import { getEncodedFqn } from '../utils/StringUtils';
import APIClient from './index';

const BASE_URL = '/queryReports';

export const getQueryReports = async (params?: ListParams) => {
  const response = await APIClient.get<PagingResponse<QueryReport[]>>(
    BASE_URL,
    { params }
  );

  return response.data;
};

export const getQueryReportByFqn = async (fqn: string, params?: ListParams) => {
  const response = await APIClient.get<QueryReport>(
    `${BASE_URL}/name/${getEncodedFqn(fqn)}`,
    { params }
  );

  return response.data;
};

export const createQueryReport = async (data: CreateQueryReport) => {
  const response = await APIClient.post<
    CreateQueryReport,
    AxiosResponse<QueryReport>
  >(BASE_URL, data);

  return response.data;
};

export const patchQueryReport = async (id: string, data: Operation[]) => {
  const response = await APIClient.patch<
    Operation[],
    AxiosResponse<QueryReport>
  >(`${BASE_URL}/${id}`, data);

  return response.data;
};

export const restoreQueryReport = async (id: string) => {
  const response = await APIClient.put<
    RestoreRequestType,
    AxiosResponse<QueryReport>
  >(`${BASE_URL}/restore`, { id });

  return response.data;
};

export const getQueryReportVersions = async (id: string) => {
  const response = await APIClient.get<EntityHistory>(
    `${BASE_URL}/${id}/versions`
  );

  return response.data;
};

export const getQueryReportVersion = async (id: string, versionId?: string) => {
  const response = await APIClient.get<QueryReport>(
    `${BASE_URL}/${id}/versions/${versionId}`
  );

  return response.data;
};

export const updateQueryReportVote = async (id: string, data: VoteType) => {
  const response = await APIClient.put<VoteType, AxiosResponse<QueryReport>>(
    `${BASE_URL}/${id}/vote`,
    data
  );

  return response.data;
};

export const addQueryReportFollower = async (id: string, userId: string) => {
  const response = await APIClient.put<
    string,
    AxiosResponse<{
      changeDescription: { fieldsAdded: { newValue: EntityReference[] }[] };
    }>
  >(
    `${BASE_URL}/${id}/followers`,
    userId,
    APPLICATION_JSON_CONTENT_TYPE_HEADER
  );

  return response.data;
};

export const removeQueryReportFollower = async (id: string, userId: string) => {
  const response = await APIClient.delete<
    string,
    AxiosResponse<{
      changeDescription: { fieldsDeleted: { oldValue: EntityReference[] }[] };
    }>
  >(
    `${BASE_URL}/${id}/followers/${userId}`,
    APPLICATION_JSON_CONTENT_TYPE_HEADER
  );

  return response.data;
};
