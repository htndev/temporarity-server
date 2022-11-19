"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.WorkspaceRoutesService = void 0;
var workspace_route_type_1 = require("./../common/types/workspace-route.type");
var common_1 = require("@nestjs/common");
// import { fromBuffer } from 'file-type';
var nestjs_s3_1 = require("nestjs-s3");
var uuid_1 = require("uuid");
var routes_constant_1 = require("../common/constants/routes.constant");
var workspace_route_response_type_1 = require("../common/types/workspace-route-response.type");
var workspace_routes_util_1 = require("../common/utils/workspace-routes.util");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var mime = require('mime-types');
var WorkspaceRoutesService = /** @class */ (function () {
    function WorkspaceRoutesService(workspaceRepository, workspaceRouteRepository, workspaceRouteRequestRepository, workspaceRouteResponseRepository, s3Client, securityConfig) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceRouteRepository = workspaceRouteRepository;
        this.workspaceRouteRequestRepository = workspaceRouteRequestRepository;
        this.workspaceRouteResponseRepository = workspaceRouteResponseRepository;
        this.s3Client = s3Client;
        this.securityConfig = securityConfig;
    }
    WorkspaceRoutesService.prototype.getWorkspaceRoutes = function (slug) {
        return __awaiter(this, void 0, Promise, function () {
            var workspace, routes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workspaceRepository.getWorkspaceBySlug(slug)];
                    case 1:
                        workspace = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRoutes(workspace.id)];
                    case 2:
                        routes = _a.sent();
                        return [2 /*return*/, {
                                status: common_1.HttpStatus.OK,
                                message: 'Workspace routes retrieved successfully',
                                routes: routes
                            }];
                }
            });
        });
    };
    WorkspaceRoutesService.prototype.createRoute = function (slug, createWorkspaceRouteDto) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var startsWithWildcardRegExp, endsWithWildcardRegExp, singleWildcardRegExp, path_1, workspace, similarRoutes, similarRoute, possibleBuffer, insertData, contentType, ext, key, path, url;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (createWorkspaceRouteDto.methods.length === 0 &&
                            createWorkspaceRouteDto.methods.every(function (method) { return routes_constant_1.ALLOWED_HTTP_METHODS.includes(method); })) {
                            throw new common_1.BadRequestException('Invalid HTTP methods provided.');
                        }
                        if (createWorkspaceRouteDto.path.includes(workspace_route_type_1.Placeholder.Wildcard)) {
                            startsWithWildcardRegExp = /^\/\*\//;
                            endsWithWildcardRegExp = /\/\*$/;
                            singleWildcardRegExp = /\/\/*\//;
                            path_1 = workspace_routes_util_1.buildRoutePath(createWorkspaceRouteDto.path);
                            if ([startsWithWildcardRegExp, endsWithWildcardRegExp, singleWildcardRegExp].some(function (regExp) { return regExp.test(path_1); })) {
                                throw new common_1.BadRequestException("Invalid path provided. Wildcard placeholder couldn't be used in single way.");
                            }
                        }
                        return [4 /*yield*/, this.workspaceRepository.getWorkspaceBySlug(slug)];
                    case 1:
                        workspace = _b.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRouteByPath(workspace.id, workspace_routes_util_1.buildRoutePath(createWorkspaceRouteDto.path), createWorkspaceRouteDto.methods)];
                    case 2:
                        similarRoutes = _b.sent();
                        if (similarRoutes) {
                            similarRoute = similarRoutes[0];
                            throw new common_1.ConflictException("Route '" + createWorkspaceRouteDto.path + "' is conflicting with '" + similarRoute.path + "' route.");
                        }
                        possibleBuffer = (_a = createWorkspaceRouteDto.response) === null || _a === void 0 ? void 0 : _a.buffer;
                        if (!(createWorkspaceRouteDto.responseType === workspace_route_response_type_1.WorkspaceRouteResponseType.File && possibleBuffer instanceof Buffer)) return [3 /*break*/, 5];
                        contentType = createWorkspaceRouteDto.response.mimetype;
                        ext = mime.extension(contentType);
                        key = uuid_1.v4();
                        path = this.securityConfig.s3BucketFolder + "/" + key + "." + ext;
                        return [4 /*yield*/, this.s3Client
                                .upload({
                                Bucket: this.securityConfig.s3BucketName,
                                ACL: 'public-read',
                                Body: possibleBuffer,
                                Key: path
                            })
                                .promise()];
                    case 3: return [4 /*yield*/, _b.sent()];
                    case 4:
                        url = (_b.sent()).Location;
                        insertData = url;
                        return [3 /*break*/, 6];
                    case 5:
                        if (createWorkspaceRouteDto.responseType === workspace_route_response_type_1.WorkspaceRouteResponseType.RandomImage) {
                            insertData = null;
                        }
                        else if (createWorkspaceRouteDto.responseType === workspace_route_response_type_1.WorkspaceRouteResponseType.Schema) {
                            insertData = createWorkspaceRouteDto.response;
                        }
                        _b.label = 6;
                    case 6: return [4 /*yield*/, this.workspaceRouteRepository.createRoute(workspace.id, createWorkspaceRouteDto.path, __spreadArrays(new Set(createWorkspaceRouteDto.methods)), createWorkspaceRouteDto.status, createWorkspaceRouteDto.responseType, insertData)];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, {
                                status: common_1.HttpStatus.CREATED,
                                message: 'Route created successfully'
                            }];
                }
            });
        });
    };
    WorkspaceRoutesService.prototype.getRouteDetails = function (slug, id) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace, route, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workspaceRepository.getWorkspaceBySlug(slug)];
                    case 1:
                        workspace = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRoute(workspace.id, id)];
                    case 2:
                        route = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteResponseRepository.findOne({ where: { routeId: route.id } })];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, {
                                status: common_1.HttpStatus.OK,
                                message: 'Route details retrieved successfully',
                                responseType: response.responseType,
                                response: response.schema
                            }];
                }
            });
        });
    };
    WorkspaceRoutesService.prototype.updateRouteMethods = function (slug, id, updateRouteMethodsDto) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace, route, conflictingRoute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workspaceRepository.getWorkspaceBySlug(slug)];
                    case 1:
                        workspace = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRoute(workspace.id, id)];
                    case 2:
                        route = _a.sent();
                        if (updateRouteMethodsDto.methods.length === 0 &&
                            updateRouteMethodsDto.methods.every(function (method) { return routes_constant_1.ALLOWED_HTTP_METHODS.includes(method); })) {
                            throw new common_1.BadRequestException('Invalid HTTP methods provided.');
                        }
                        return [4 /*yield*/, this.getConflictingRoute(workspace.id, route, updateRouteMethodsDto.methods)];
                    case 3:
                        conflictingRoute = _a.sent();
                        if (conflictingRoute) {
                            throw new common_1.ConflictException("Route '" + route.path + "' is conflicting with '" + conflictingRoute.path + "' route. They have conflicted method/methods.");
                        }
                        route.methods = updateRouteMethodsDto.methods;
                        return [4 /*yield*/, route.save()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, {
                                status: common_1.HttpStatus.OK,
                                message: 'Route methods updated successfully'
                            }];
                }
            });
        });
    };
    WorkspaceRoutesService.prototype.updateRoutePath = function (slug, id, updateRoutePathDto) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace, route, conflictingRoutes, hasConflictingRoute, conflictingRoute, conflictingMethods;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workspaceRepository.getWorkspaceBySlug(slug)];
                    case 1:
                        workspace = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRoute(workspace.id, id)];
                    case 2:
                        route = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRouteByPath(workspace.id, workspace_routes_util_1.buildRoutePath(updateRoutePathDto.path), route.methods)];
                    case 3:
                        conflictingRoutes = _a.sent();
                        hasConflictingRoute = conflictingRoutes !== null;
                        if (hasConflictingRoute) {
                            conflictingRoute = conflictingRoutes[0];
                            if (conflictingRoute && conflictingRoute.methods.some(function (method) { return route.methods.includes(method); })) {
                                conflictingMethods = conflictingRoute.methods.filter(function (method) { return route.methods.includes(method); });
                                throw new common_1.ConflictException("Route '" + updateRoutePathDto.path + "' is conflicting with '" + conflictingRoute.path + "' route. They have conflicted " + conflictingMethods.join(', ') + " " + (conflictingMethods.length === 1 ? 'method' : 'methods') + ".");
                            }
                        }
                        route.path = workspace_routes_util_1.buildRoutePath(updateRoutePathDto.path);
                        route.pathPattern = workspace_routes_util_1.buildRoutePattern(updateRoutePathDto.path);
                        return [4 /*yield*/, route.save()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, {
                                status: common_1.HttpStatus.OK,
                                message: 'Route path updated successfully'
                            }];
                }
            });
        });
    };
    WorkspaceRoutesService.prototype.updateRouteStatus = function (slug, id, updateRouteStatusDto) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace, route;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workspaceRepository.getWorkspaceBySlug(slug)];
                    case 1:
                        workspace = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRoute(workspace.id, id)];
                    case 2:
                        route = _a.sent();
                        route.status = updateRouteStatusDto.status;
                        return [4 /*yield*/, route.save()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, {
                                status: common_1.HttpStatus.OK,
                                message: 'Route status updated successfully'
                            }];
                }
            });
        });
    };
    WorkspaceRoutesService.prototype.updateRouteResponse = function (slug, id, updateRouteResponseDto) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var workspace, route, possibleBuffer, contentType, ext, key, path, url, response;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.workspaceRepository.getWorkspaceBySlug(slug)];
                    case 1:
                        workspace = _b.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRoute(workspace.id, id)];
                    case 2:
                        route = _b.sent();
                        if (!(updateRouteResponseDto.responseType === workspace_route_response_type_1.WorkspaceRouteResponseType.File)) return [3 /*break*/, 4];
                        possibleBuffer = (_a = updateRouteResponseDto.response) === null || _a === void 0 ? void 0 : _a.buffer;
                        if (!(possibleBuffer instanceof Buffer)) return [3 /*break*/, 4];
                        contentType = updateRouteResponseDto.response.mimetype;
                        ext = mime.extension(contentType);
                        key = uuid_1.v4();
                        path = this.securityConfig.s3BucketFolder + "/" + key + "." + ext;
                        return [4 /*yield*/, this.s3Client
                                .upload({
                                Bucket: this.securityConfig.s3BucketName,
                                ACL: 'public-read',
                                Body: possibleBuffer,
                                Key: path
                            })
                                .promise()];
                    case 3:
                        url = (_b.sent()).Location;
                        updateRouteResponseDto.response = url;
                        _b.label = 4;
                    case 4: return [4 /*yield*/, this.workspaceRouteResponseRepository.findOne({ where: { routeId: route.id } })];
                    case 5:
                        response = _b.sent();
                        response.responseType = updateRouteResponseDto.responseType;
                        response.schema = updateRouteResponseDto.response;
                        return [4 /*yield*/, response.save()];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, {
                                status: common_1.HttpStatus.OK,
                                message: 'Route response updated successfully'
                            }];
                }
            });
        });
    };
    WorkspaceRoutesService.prototype.deleteRoute = function (slug, routeId) {
        return __awaiter(this, void 0, void 0, function () {
            var workspace, route, routeRequest, routeResponseHeaders, routeResponse;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workspaceRepository.getWorkspaceBySlug(slug)];
                    case 1:
                        workspace = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteRepository.getRoute(workspace.id, routeId)];
                    case 2:
                        route = _a.sent();
                        if (!route) {
                            throw new common_1.NotFoundException('Route not found');
                        }
                        return [4 /*yield*/, this.workspaceRouteRequestRepository.findOne({ where: { routeId: route.id } })];
                    case 3:
                        routeRequest = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteRequestRepository.find({ where: { routeId: route.id } })];
                    case 4:
                        routeResponseHeaders = _a.sent();
                        return [4 /*yield*/, this.workspaceRouteResponseRepository.findOne({ where: { routeId: route.id } })];
                    case 5:
                        routeResponse = _a.sent();
                        return [4 /*yield*/, routeResponse.remove()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, routeRequest.remove()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(routeResponseHeaders.map(function (header) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, header.remove()];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }))];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, route.remove()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, {
                                status: common_1.HttpStatus.OK,
                                message: 'Route deleted successfully'
                            }];
                }
            });
        });
    };
    WorkspaceRoutesService.prototype.getConflictingRoute = function (workspaceId, route, methods) {
        return __awaiter(this, void 0, Promise, function () {
            var routes, conflictRoute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workspaceRouteRepository.findWorkspaceRoutes(workspaceId, route.path)];
                    case 1:
                        routes = _a.sent();
                        conflictRoute = routes.find(function (wr) {
                            return methods.some(function (method) { return wr.methods.includes(method); }) &&
                                wr.pathPattern.toString() === route.pathPattern.toString() &&
                                wr.id.toString() !== route.id.toString();
                        });
                        return [2 /*return*/, conflictRoute !== null && conflictRoute !== void 0 ? conflictRoute : null];
                }
            });
        });
    };
    WorkspaceRoutesService = __decorate([
        common_1.Injectable(),
        __param(4, nestjs_s3_1.InjectS3())
    ], WorkspaceRoutesService);
    return WorkspaceRoutesService;
}());
exports.WorkspaceRoutesService = WorkspaceRoutesService;
