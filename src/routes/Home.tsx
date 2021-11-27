import React, { useState } from "react";
import { DateFilter, defaultDateFilterOptions, DateFilterOption, DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import Page from "../components/Page";
import * as Ldm from "./../md/full";
import { LineChart } from "@gooddata/sdk-ui-charts";
import styles from "./Home.module.scss";
import cx from "classnames";
import CustomComponent from "../components/CustomComponent";

interface IDateFilterComponentState {
    selectedFilterOption: DateFilterOption;
    excludeCurrentPeriod: boolean;
}

const Home: React.FC = () => {

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
                    <CustomComponent dateFilter={dateFilter}></CustomComponent>
                </div>
            </div>
        </Page>
    );
};

export default Home;
