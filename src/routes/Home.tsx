import React, { useState } from "react";
import { DateFilter, defaultDateFilterOptions, DateFilterOption, DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import Page from "../components/Page";
import * as Ldm from "./../md/full";
import { LineChart } from "@gooddata/sdk-ui-charts";
import { IDataSeries, LoadingComponent, useExecutionDataView } from "@gooddata/sdk-ui";
import styles from "./Home.module.scss";
import cx from "classnames";

interface IDateFilterComponentState {
    selectedFilterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
}

const Home: React.FC = () => {

    const [selectorState, setSelectorState] = useState<string>('maxrevenue');
    const [quantileState, setQuantileState] = useState<number>(0.5);
    const [dateFilterState, setDateFilterState] = useState<IDateFilterComponentState>({
        selectedFilterOption: defaultDateFilterOptions.allTime!,
        excludeCurrentPeriod: false,
    });

    const onApply = (selectedFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => {
        setDateFilterState({
            selectedFilterOption,
            excludeCurrentPeriod,
        });
    };

    const dateFilter = DateFilterHelpers.mapOptionToAfm(
        dateFilterState.selectedFilterOption,
        Ldm.DateDatasets.Date.ref,
        dateFilterState.excludeCurrentPeriod,
    );

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
        return <div className={cx(styles.Temp)}>
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
        <Page>
            <div className={cx(styles.Container)}>
                <h1>My Dashboard {JSON.stringify(dateFilterState.selectedFilterOption.type)}</h1>
                <div className={cx(styles.Filter)}>
                    <DateFilter excludeCurrentPeriod={dateFilterState.excludeCurrentPeriod}
                        selectedFilterOption={dateFilterState.selectedFilterOption}
                        filterOptions={defaultDateFilterOptions}
                        customFilterName="Selected date"
                        dateFilterMode="active"
                        dateFormat="dd.MM.yyyy"
                        onApply={onApply}/>
                </div>
                <div className={cx(styles.Content)}>
                    <div className={cx(styles.LineChart)}>
                        <LineChart measures={[Ldm.Revenue]}
                            segmentBy={Ldm.Product.Default}
                            trendBy={Ldm.DateDatasets.Date.Month.Short}
                            filters={dateFilter?[dateFilter]: []}/>
                    </div>
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
                </div>
            </div>
        </Page>
    );
};

export default Home;
