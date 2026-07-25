package org.openmetadata.service.resources.queryreport;

import org.openmetadata.schema.api.data.CreateQueryReport;
import org.openmetadata.schema.entity.data.QueryReport;
import org.openmetadata.service.mapper.EntityMapper;

public class QueryReportMapper implements EntityMapper<QueryReport, CreateQueryReport> {
  @Override
  public QueryReport createToEntity(CreateQueryReport create, String user) {
    return copy(new QueryReport(), create, user)
        .withReportType(create.getReportType())
        .withSourceUrl(create.getSourceUrl());
  }
}
