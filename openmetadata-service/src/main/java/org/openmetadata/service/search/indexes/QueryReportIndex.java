package org.openmetadata.service.search.indexes;

import java.util.Map;
import org.openmetadata.schema.entity.data.QueryReport;
import org.openmetadata.service.Entity;

public class QueryReportIndex implements TaggableIndex, LineageIndex {
  final QueryReport queryReport;

  public QueryReportIndex(QueryReport queryReport) {
    this.queryReport = queryReport;
  }

  @Override
  public Object getEntity() {
    return queryReport;
  }

  @Override
  public String getEntityTypeName() {
    return Entity.QUERY_REPORT;
  }

  public Map<String, Object> buildSearchIndexDocInternal(Map<String, Object> doc) {
    doc.put("reportType", queryReport.getReportType());
    doc.put("sourceUrl", queryReport.getSourceUrl());
    return doc;
  }

  public static Map<String, Float> getFields() {
    Map<String, Float> fields = SearchIndex.getDefaultFields();
    fields.put("reportType", 3.0f);
    return fields;
  }
}
