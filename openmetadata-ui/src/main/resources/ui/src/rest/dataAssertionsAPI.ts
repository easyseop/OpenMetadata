/*
 *  Copyright 2026 Collate.
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
import { PagingResponse } from 'Models';
import { TestCase } from '../generated/tests/testCase';
import { ListParams } from '../interface/API.interface';
import APIClient from './index';

const BASE_URL = '/dataQuality/testCases';

export const getAllTestCases = async (params?: ListParams) => {
  const response = await APIClient.get<PagingResponse<TestCase[]>>(BASE_URL, {
    params,
  });

  return response.data;
};
