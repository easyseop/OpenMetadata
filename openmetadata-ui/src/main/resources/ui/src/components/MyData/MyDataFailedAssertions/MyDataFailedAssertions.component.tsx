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
import {
  Badge,
  Box,
  Card,
  FeaturedIcon,
  Typography,
} from '@openmetadata/ui-core-components';
import { AlertTriangle } from '@untitledui/icons';
import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EntityType } from '../../../enums/entity.enum';
import { TestCase, TestCaseStatus } from '../../../generated/tests/testCase';
import { useApplicationStore } from '../../../hooks/useApplicationStore';
import { getAllTestCases } from '../../../rest/dataAssertionsAPI';
import entityUtilClassBase from '../../../utils/EntityUtilClassBase';
import { getEntityColumnFQN, getEntityFQN } from '../../../utils/FeedUtils';

interface FailedAssertionItem {
  id: string;
  tableFqn: string;
  columnName: string;
  message?: string;
}

const toFailedAssertionItem = (tc: TestCase): FailedAssertionItem => {
  const tableFqn = getEntityFQN(tc.entityLink) ?? '';
  const columnFqn = getEntityColumnFQN(tc.entityLink) ?? '';
  const columnName = columnFqn ? columnFqn.split('.').pop() ?? '' : '';

  return {
    id: tc.id ?? tc.name,
    tableFqn,
    columnName,
    message: tc.testCaseResult?.result,
  };
};

const MyDataFailedAssertions = () => {
  const { t } = useTranslation();
  const { currentUser } = useApplicationStore();
  const [items, setItems] = useState<FailedAssertionItem[]>([]);

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const fetchFailedAssertions = async () => {
      try {
        const response = await getAllTestCases({
          limit: 200,
          fields: 'testCaseResult,owners',
        } as never);

        const ownedFailed = response.data
          .filter(
            (tc) =>
              tc.testCaseResult?.testCaseStatus === TestCaseStatus.Failed &&
              tc.owners?.some((owner) => owner.id === currentUser.id)
          )
          .map(toFailedAssertionItem);

        setItems(ownedFailed);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error as AxiosError);
      }
    };

    fetchFailedAssertions();
  }, [currentUser?.id]);

  const hasFailedAssertions = useMemo(() => items.length > 0, [items]);

  if (!hasFailedAssertions) {
    return null;
  }

  return (
    <Box className="tw:px-6 tw:mt-4" direction="col" gap={3}>
      <Box align="center" direction="row" gap={2}>
        <FeaturedIcon
          color="error"
          icon={AlertTriangle}
          size="sm"
          theme="light"
        />
        <Typography size="text-md" weight="semibold">
          {t('label.my-failed-assertion-plural')}
        </Typography>
        <Badge color="error" size="sm">
          {items.length}
        </Badge>
      </Box>
      <Box
        className="tw:grid tw:grid-cols-1 tw:gap-3 tw:md:grid-cols-2"
        direction="row">
        {items.map((item) => (
          <Link
            key={item.id}
            to={entityUtilClassBase.getEntityLink(
              EntityType.TABLE,
              item.tableFqn
            )}>
            <Card style={{ padding: 16 }} variant="outlined">
              <Box direction="col" gap={1}>
                <Typography size="text-sm" weight="medium">
                  {item.tableFqn.split('.').pop()} · {item.columnName}
                </Typography>
                <Typography className="tw:text-secondary" size="text-xs">
                  {item.message}
                </Typography>
              </Box>
            </Card>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default MyDataFailedAssertions;
