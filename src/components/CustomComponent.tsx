import React, { useState } from "react";
import cx from "classnames";
import styles from "./CustomComponent.module.scss";
import { IDataSeries, LoadingComponent, useExecutionDataView } from "@gooddata/sdk-ui";
import * as Ldm from "./../md/full";
import { IDateFilter } from "@gooddata/sdk-model";


interface ICustomComponentProps {
    dateFilter: IDateFilter;
}

const CustomComponent: React.FC<ICustomComponentProps> = ({ dateFilter }) => {

    const [selectorState, setSelectorState] = useState<string>('maxrevenue');
    const [quantileState, setQuantileState] = useState<number>(0.5);

    const executionDataView = useExecutionDataView({
        execution: {
            seriesBy: [Ldm.Revenue, Ldm.Product.Default],
            slicesBy: [Ldm.DateDatasets.Date.Month.Short],
            filters: [dateFilter]
        }
    });
    const series = executionDataView.result?.data().series().toArray();

    const maxRevenueView = function (dataTable: IDataSeries[] | undefined) {
        if (dataTable === undefined) {
            return <h1>N/A</h1>;
        }
        const result = dataTable.map(slice => {
            return {
                title: slice.scopeTitles()[0],
                value: slice.dataPoints().map(dataPoint => {
                    return dataPoint.rawValue
                }).reduce((prev, curr) => (Number(prev) + Number(curr)).toFixed(2), 0)
            }
        }).reduce((prev, curr) => {
            if (Number(prev.value) < Number(curr.value)) {
                return curr;
            }
            return prev;
        });
        return <div>
            <h1>$ {result.value}</h1>
            <h3>from {result.title}</h3>
        </div>
    }

    const minRevenueView = function (dataTable: IDataSeries[] | undefined) {
        if (dataTable === undefined) {
            return <h1>N/A</h1>;
        }
        const result = dataTable.map(slice => {
            return {
                title: slice.scopeTitles()[0],
                value: slice.dataPoints().map(dataPoint => {
                    return dataPoint.rawValue
                }).reduce((prev, curr) => (Number(prev) + Number(curr)).toFixed(2), 0)
            }
        }).reduce((prev, curr) => {
            if (Number(prev.value) > Number(curr.value)) {
                return curr;
            }
            return prev;
        });
        return <div>
            <h1>$ {result.value}</h1>
            <h3>from {result.title}</h3>
        </div>
    }

    const quantileView = function quantile(dataTable: IDataSeries[] | undefined, percentile: number) {
        if (dataTable === undefined) {
            return <h1>N/A</h1>;
        }
        let array = dataTable.map(slice => {
            return {
                title: slice.scopeTitles()[0],
                value: slice.dataPoints().map(dataPoint => {
                    return dataPoint.rawValue
                }).reduce((prev, curr) => (Number(prev) + Number(curr)).toFixed(2), 0)
            }
        });
        array.sort((a, b) => Number(a.value) - Number(b.value));
        let index = percentile * (array.length - 1);
        let result;
        if (Math.floor(index) === index) {
            result = array[index].value;
        } else {
            let i = Math.floor(index);
            let fraction = index - i;
            result = Number(array[i].value) + (Number(array[i + 1].value) - Number(array[i].value)) * fraction;
        }
        result = Number(result).toFixed(2);
        return <div className={cx(styles.Vertical)}>
            <h1>$ {result}</h1>
            <input type="range" min="0" max="1" step="0.05" value={quantileState} onChange={e => setQuantileState(Number(e.target.value))}></input>
            <h3>σ = {quantileState}</h3>
        </div>
    }

    return (
        <div className={cx(styles.CustomComponent)}>
            {executionDataView.status === "error" && <h1>N/A</h1>}
            {executionDataView.status === "loading" && (
                <div className={cx(styles.Loading)}>
                    <div className="gd-message progress"></div>
                    <LoadingComponent />
                </div>
            )}
            {executionDataView.status === "success" && (
                <div className={cx(styles.Vertical)}>
                    {selectorState === "maxrevenue" && maxRevenueView(series)}
                    {selectorState === "minrevenue" && minRevenueView(series)}
                    {selectorState === "quantiles" && quantileView(series, quantileState)}
                    <select className={cx(styles.Selector)} value={selectorState} onChange={e => setSelectorState(e.target.value)}>
                        <option value="maxrevenue">Maximum total revenue</option>
                        <option value="minrevenue">Minimum total revenue</option>
                        <option value="quantiles">Quantiles</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default CustomComponent;
