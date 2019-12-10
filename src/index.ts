import Vue from "vue";
import { CoderrClient, getCoderrCollection, ContextCollection } from "Coderr.Client";

export function catchVueErrors(client: CoderrClient) {
    Vue.config.errorHandler = (error: Error, viewModel: any, info: string) => {

        var componentCollection = extractComponentCollection(viewModel);
        var routerCollection = extractRouteCollection(viewModel.$router.currentRoute);
        var componentHtmlCollection = {
            name: "VueHTML",
            properties: { html: viewModel.$el.outerHTML }

        };

        function extractComponentCollection(viewModel: any) {
            const properties: any = {};
            const collection = { name: "VueComponent", properties: properties };

            const id = viewModel.$el.id;
            properties["element.id"] = id !== "" ? id : `${viewModel.$el.className}`;
            properties["tag"] = viewModel.$vnode.tag;

            //const newObj = { ...viewModel.$data };
            //appendToCollection(collection, "data", newObj);

            for (const propertyName in viewModel) {
                if (!viewModel.hasOwnProperty(propertyName))
                    continue;

                const propertyValue = viewModel[propertyName];
                if (propertyName.substr(0, 1) === "$") {
                    continue;
                }
                if (typeof propertyValue === "function")
                    continue;

                if (propertyName === "_computedWatchers") {
                    for (const w in propertyValue) {
                        properties[w] = propertyValue[w].value;
                    }
                } else if (propertyName === '_watchers') {
                    let index = 0;
                    for (const w in propertyValue) {
                        properties[`watcher[${index}].expression`] = propertyValue[w].expression.toString();
                        if (propertyValue[w].value) {
                            properties[`watcher[${index++}].fullPath`] = propertyValue[w].value.fullPath;
                        }
                    }

                } else {
                    if (propertyValue === null || typeof propertyValue === "undefined") {
                        properties[propertyName] = propertyValue;

                    } else if (Object.keys(propertyValue).length > 0) {

                        if (Object.keys(propertyValue).length === 1) {
                            //console.log("GOT ONE", propertyValue);
                            //componentCollection[propertyName] = JSON.stringify(propertyValue);
                        } else {
                            continue;
                        }

                    } else {
                        if (!propertyValue.toString) {
                            //console.log("UNNKOWN!", propertyName, propertyValue);
                        } else {
                            properties[propertyName] = propertyValue.toString();
                        }
                    }

                }
            }
            return collection;
        }

        function extractRouteCollection(route: any) {
            var properties: any = {};

            for (const propertyName in route) {
                if (!route.hasOwnProperty(propertyName))
                    continue;

                const propertyValue = route[propertyName];
                if (propertyValue === null || typeof propertyValue === "undefined" || typeof propertyValue === "string" || typeof  propertyValue === "number" || typeof propertyValue === "boolean") {
                    properties[propertyName] = propertyValue;
                } else if (Object.keys(propertyValue).length > 0) {
                    if (propertyName === "matched") {
                        let index = 0;
                        propertyValue.forEach((x: any) => {
                            var name = "matched[" + (index++) + "]";
                            properties[`${name}.name`] = x.name;
                            properties[`${name}.path`] = x.path;
                            properties[`${name}.parent`] = x.parent;
                            properties[`${name}.regex`] = x.regex.toString();
                            console.log("props", x.props);
                            console.log("data", x.data);
                            //properties[`${name}.props`] = JSON.stringify(x.props);
                        });
                    } else if (Object.keys(propertyValue).length < 10) {
                        console.log("ignoring", propertyName, propertyValue, typeof propertyValue);
                    } else {
                        continue;
                    }
                } else {
                    properties[propertyName] = viewModel[propertyName];
                }
            }
            return { name: "VueRoutes", properties: properties };
        }

        var collections: ContextCollection[] = [componentCollection, componentHtmlCollection, routerCollection];
        var collection = getCoderrCollection(collections);
        collection.properties['HighlightCollections'] = 'VueComponent';
        client.report(error, collections);
    }
}
