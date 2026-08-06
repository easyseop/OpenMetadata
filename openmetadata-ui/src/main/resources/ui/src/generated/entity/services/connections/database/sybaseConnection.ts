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
/**
 * Sybase Database Service connection.
 */
export interface SybaseConnection {
    connectionOptions?: { [key: string]: string };
    /**
     * Database of the data source.
     */
    database?: string;
    /**
     * Regex to only include/exclude databases that match the pattern.
     */
    databaseFilterPattern?: FilterPattern;
    /**
     * Host and port of the Sybase service.
     */
    hostPort?: string;
    /**
     * Password to connect to Sybase.
     */
    password?: string;
    /**
     * Regex to only include/exclude schemas that match the pattern.
     */
    schemaFilterPattern?: FilterPattern;
    /**
     * SQLAlchemy driver scheme options.
     */
    scheme?: SybaseScheme;
    /**
     * Source Python Class Name to be instantiated by the ingestion workflow
     */
    sourcePythonClass?:          string;
    supportsMetadataExtraction?: boolean;
    /**
     * Regex to only include/exclude tables that match the pattern.
     */
    tableFilterPattern?: FilterPattern;
    /**
     * Sybase database service type
     */
    type: ServiceType;
    /**
     * Username to connect to Sybase. This user should have privileges to read all the metadata
     * in Sybase.
     */
    username?: string;
    [property: string]: any;
}

/**
 * Regex to only include/exclude databases that match the pattern.
 *
 * Regex to only fetch entities that matches the pattern.
 *
 * Regex to only include/exclude schemas that match the pattern.
 *
 * Regex to only include/exclude tables that match the pattern.
 */
export interface FilterPattern {
    /**
     * List of strings/regex patterns to match and exclude only database entities that match.
     */
    excludes?: string[];
    /**
     * List of strings/regex patterns to match and include only database entities that match.
     */
    includes?: string[];
}

/**
 * SQLAlchemy driver scheme options.
 */
export enum SybaseScheme {
    SybasePyodbc = "sybase+pyodbc",
}

/**
 * Sybase database service type
 */
export enum ServiceType {
    Sybase = "Sybase",
}
