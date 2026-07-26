/*
 *  Copyright 2025 Collate.
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

import { act, renderHook } from '@testing-library/react';
import { SearchIndex } from '../../../../enums/search.enum';
import { SearchResponse } from '../../../../interface/search.interface';
import { searchQuery } from '../../../../rest/searchAPI';
import { useDataFetching } from './useDataFetching';

jest.mock('../../../../rest/searchAPI', () => ({
  searchQuery: jest.fn(),
}));
jest.mock('../../../../utils/ToastUtils', () => ({
  showErrorToast: jest.fn(),
}));

describe('useDataFetching', () => {
  it('stores only entities returned by the configured transform', async () => {
    const response = {
      aggregations: {},
      hits: {
        hits: [],
        total: { value: 1 },
      },
    } as SearchResponse<SearchIndex.DOMAIN>;
    const transformedEntities = [{ id: 'domain-id' }];
    const transform = jest.fn(() => transformedEntities);
    (searchQuery as jest.Mock).mockResolvedValueOnce(response);

    const { result } = renderHook(() =>
      useDataFetching({
        searchIndex: SearchIndex.DOMAIN,
        transform,
      })
    );

    await act(async () => {
      await result.current.searchEntities(1, 'bank', {});
    });

    expect(transform).toHaveBeenCalledWith(response);
    expect(result.current.entities).toEqual(transformedEntities);
    expect(result.current.totalEntities).toBe(1);
  });
});
