/*
 *  Copyright 2021 Collate
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
package org.openmetadata.service.jdbi3;

import lombok.extern.slf4j.Slf4j;
import org.openmetadata.schema.entity.data.QueryReport;
import org.openmetadata.schema.type.change.ChangeSource;
import org.openmetadata.service.Entity;
import org.openmetadata.service.resources.queryreport.QueryReportResource;
import org.openmetadata.service.util.EntityUtil;
import org.openmetadata.service.util.EntityUtil.RelationIncludes;

@Slf4j
public class QueryReportRepository extends EntityRepository<QueryReport> {
  public QueryReportRepository() {
    super(
        QueryReportResource.COLLECTION_PATH,
        Entity.QUERY_REPORT,
        QueryReport.class,
        Entity.getCollectionDAO().queryReportDAO(),
        "",
        "");
    supportsSearch = true;
    renameAllowed = true;
  }

  @Override
  public void setFullyQualifiedName(QueryReport queryReport) {
    queryReport.setFullyQualifiedName(queryReport.getName());
  }

  @Override
  public void prepare(QueryReport queryReport, boolean update) {
    // Nothing to validate beyond the base entity fields.
  }

  @Override
  public void setFields(
      QueryReport queryReport, EntityUtil.Fields fields, RelationIncludes relationIncludes) {
    // No relationship-backed fields to fetch. Related Queries are looked up separately via
    // GET /v1/queries?entityId={id}&entityType=queryReport (see QueryRepository#getQueryUsage).
  }

  @Override
  protected void clearFields(QueryReport queryReport, EntityUtil.Fields fields) {
    // No relationship-backed fields to clear.
  }

  @Override
  public void storeEntity(QueryReport queryReport, boolean update) {
    store(queryReport, update);
  }

  @Override
  public void storeRelationships(QueryReport queryReport) {
    // QueryReport <-> Query links are owned by QueryRepository (queryUsedIn/MENTIONED_IN).
  }

  @Override
  public EntityRepository<QueryReport>.EntityUpdater getUpdater(
      QueryReport original, QueryReport updated, Operation operation, ChangeSource changeSource) {
    return new QueryReportUpdater(original, updated, operation);
  }

  public class QueryReportUpdater extends EntityUpdater {
    public QueryReportUpdater(QueryReport original, QueryReport updated, Operation operation) {
      super(original, updated, operation);
    }

    @Override
    public void entitySpecificUpdate(boolean consolidatingChanges) {
      compareAndUpdate(
          "reportType",
          () -> recordChange("reportType", original.getReportType(), updated.getReportType()));
      compareAndUpdate(
          "sourceUrl",
          () -> recordChange("sourceUrl", original.getSourceUrl(), updated.getSourceUrl()));
    }
  }
}
