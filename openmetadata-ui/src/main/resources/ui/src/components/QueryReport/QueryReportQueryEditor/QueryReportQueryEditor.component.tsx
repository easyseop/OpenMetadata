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
  Box,
  Button,
  ButtonUtility,
  Card,
  Select,
  Typography,
} from '@openmetadata/ui-core-components';
import { Copy01, Edit01, Plus, Trash01 } from '@untitledui/icons';
import { AxiosError } from 'axios';
import { Operation } from 'fast-json-patch';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NO_DATA } from '../../../constants/constants';
import { CSMode } from '../../../enums/codemirror.enum';
import { ERROR_PLACEHOLDER_TYPE } from '../../../enums/common.enum';
import { EntityType } from '../../../enums/entity.enum';
import { ServiceCategory } from '../../../enums/service.enum';
import { Query } from '../../../generated/entity/data/query';
import { useClipboard } from '../../../hooks/useClipBoard';
import {
  addQueryUsage,
  deleteQuery,
  getQueriesList,
  patchQueries,
  postQuery,
} from '../../../rest/queryAPI';
import { getServices } from '../../../rest/serviceAPI';
import { formatDateTime } from '../../../utils/date-time/DateTimeUtils';
import { showErrorToast, showSuccessToast } from '../../../utils/ToastUtils';
import ErrorPlaceHolder from '../../common/ErrorWithPlaceholder/ErrorPlaceHolder';
import Loader from '../../common/Loader/Loader';
import SchemaEditor from '../../Database/SchemaEditor/SchemaEditor';
import EntityDeleteModal from '../../Modals/EntityDeleteModal/EntityDeleteModal';

interface QueryReportQueryEditorProps {
  queryReportId: string;
}

const QueryReportQueryEditor = ({
  queryReportId,
}: QueryReportQueryEditorProps) => {
  const { t } = useTranslation();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newServiceName, setNewServiceName] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [deletingQuery, setDeletingQuery] = useState<Query | null>(null);

  const { onCopyToClipBoard } = useClipboard('');

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getQueriesList({
        entityId: queryReportId,
        entityType: EntityType.QUERY_REPORT,
        fields: 'owners',
      });
      setQueries(
        response.data.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      );
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setLoading(false);
    }
  }, [queryReportId]);

  const fetchServiceOptions = useCallback(async () => {
    try {
      const response = await getServices({
        serviceName: ServiceCategory.DATABASE_SERVICES,
        limit: 25,
      });
      const names = response.data.map((service) => service.name);
      setServiceOptions(names);
      setNewServiceName((prev) => prev ?? names[0]);
    } catch {
      // Service list is only needed to create new queries; failing silently
      // keeps the read-only view usable even without database services set up.
    }
  }, []);

  useEffect(() => {
    if (queryReportId) {
      fetchQueries();
      fetchServiceOptions();
    }
  }, [queryReportId, fetchQueries, fetchServiceOptions]);

  const handleCopyAll = useCallback(() => {
    const combined = queries.map((query) => query.query).join('\n\n');
    onCopyToClipBoard(combined);
    showSuccessToast(t('message.copied-to-clipboard'));
  }, [queries, onCopyToClipBoard, t]);

  const handleStartEdit = useCallback((query: Query) => {
    setEditingId(query.id);
    setEditText(query.query);
  }, []);

  const handleStartAdd = useCallback(() => {
    setEditingId('new');
    setEditText('');
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  const handleSaveEdit = useCallback(
    async (query: Query) => {
      setSaving(true);
      try {
        const patch: Operation[] = [
          { op: 'replace', path: '/query', value: editText },
        ];
        await patchQueries(query.id, patch);
        showSuccessToast(
          t('message.update-entity-success', { entity: t('label.query') })
        );
        handleCancelEdit();
        fetchQueries();
      } catch (error) {
        showErrorToast(error as AxiosError);
      } finally {
        setSaving(false);
      }
    },
    [editText, fetchQueries, handleCancelEdit, t]
  );

  const handleSaveNew = useCallback(async () => {
    if (!editText.trim() || !newServiceName) {
      return;
    }
    setSaving(true);
    try {
      const created = await postQuery({
        query: editText,
        service: newServiceName,
      });
      await addQueryUsage(created.id, [
        { id: queryReportId, type: EntityType.QUERY_REPORT },
      ]);
      showSuccessToast(
        t('message.create-entity-success', { entity: t('label.query') })
      );
      handleCancelEdit();
      fetchQueries();
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setSaving(false);
    }
  }, [
    editText,
    newServiceName,
    queryReportId,
    fetchQueries,
    handleCancelEdit,
    t,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingQuery) {
      return;
    }
    try {
      await deleteQuery(deletingQuery.id);
      showSuccessToast(
        t('message.entity-deleted-success', { entity: t('label.query') })
      );
      setDeletingQuery(null);
      fetchQueries();
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  }, [deletingQuery, fetchQueries, t]);

  const serviceSelectItems = useMemo(
    () => serviceOptions.map((name) => ({ id: name, label: name })),
    [serviceOptions]
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <Box direction="col" gap={4}>
      <Box align="center" direction="row" gap={3} justify="between">
        <Typography size="text-md" weight="semibold">
          {t('label.query-plural')}
        </Typography>
        <Box direction="row" gap={2}>
          {queries.length > 0 && (
            <Button
              color="secondary"
              iconLeading={Copy01}
              size="sm"
              onClick={handleCopyAll}>
              {t('label.copy-all')}
            </Button>
          )}
          {editingId !== 'new' && (
            <Button
              color="primary"
              iconLeading={Plus}
              size="sm"
              onClick={handleStartAdd}>
              {t('label.add-entity', { entity: t('label.query') })}
            </Button>
          )}
        </Box>
      </Box>

      {queries.length === 0 && editingId !== 'new' && (
        <ErrorPlaceHolder
          className="border-none"
          heading={t('message.no-data-message', {
            entity: t('label.query-lowercase-plural'),
          })}
          type={ERROR_PLACEHOLDER_TYPE.NO_DATA}
        />
      )}

      {editingId === 'new' && (
        <Card style={{ padding: 16 }} variant="outlined">
          <Box direction="col" gap={3}>
            <Box style={{ maxWidth: 280 }}>
              <Select
                items={serviceSelectItems}
                label={t('label.service')}
                placeholder={t('label.select-field', {
                  field: t('label.service'),
                })}
                selectedKey={newServiceName}
                onSelectionChange={(key) => setNewServiceName(key as string)}>
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            </Box>
            <SchemaEditor
              mode={{ name: CSMode.SQL }}
              showCopyButton={false}
              value={editText}
              onChange={setEditText}
            />
            <Box direction="row" gap={2} justify="end">
              <Button color="secondary" size="sm" onClick={handleCancelEdit}>
                {t('label.cancel')}
              </Button>
              <Button
                color="primary"
                isDisabled={!editText.trim() || !newServiceName}
                isLoading={saving}
                size="sm"
                onClick={handleSaveNew}>
                {t('label.save')}
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {queries.map((query) => (
        <Card key={query.id} style={{ padding: 16 }} variant="outlined">
          <Box direction="col" gap={3}>
            <Box align="center" direction="row" justify="between">
              <Typography className="tw:text-secondary" size="text-xs">
                {t('label.updated-by')} {query.updatedBy ?? NO_DATA}
                {' · '}
                {formatDateTime(query.updatedAt)}
              </Typography>
              {editingId !== query.id && (
                <Box direction="row" gap={1}>
                  <ButtonUtility
                    color="tertiary"
                    icon={Edit01}
                    size="sm"
                    tooltip={t('label.edit')}
                    onClick={() => handleStartEdit(query)}
                  />
                  <ButtonUtility
                    color="tertiary"
                    icon={Trash01}
                    size="sm"
                    tooltip={t('label.delete')}
                    onClick={() => setDeletingQuery(query)}
                  />
                </Box>
              )}
            </Box>
            {editingId === query.id ? (
              <>
                <SchemaEditor
                  mode={{ name: CSMode.SQL }}
                  showCopyButton={false}
                  value={editText}
                  onChange={setEditText}
                />
                <Box direction="row" gap={2} justify="end">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={handleCancelEdit}>
                    {t('label.cancel')}
                  </Button>
                  <Button
                    color="primary"
                    isDisabled={!editText.trim()}
                    isLoading={saving}
                    size="sm"
                    onClick={() => handleSaveEdit(query)}>
                    {t('label.save')}
                  </Button>
                </Box>
              </>
            ) : (
              <SchemaEditor
                readOnly
                mode={{ name: CSMode.SQL }}
                value={query.query}
              />
            )}
          </Box>
        </Card>
      ))}

      {deletingQuery && (
        <EntityDeleteModal
          entityName={deletingQuery.name}
          entityType={t('label.query')}
          visible={Boolean(deletingQuery)}
          onCancel={() => setDeletingQuery(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Box>
  );
};

export default QueryReportQueryEditor;
