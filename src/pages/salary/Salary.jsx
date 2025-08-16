// import React from "react";
// import { Tabs } from "antd";
// import {
//   useGetAllSalaryQuery,
//   useGetSalaryBTM3Query,
// } from "../../context/salaryApi";
// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
// dayjs.extend(utc);
// import "./Salary.css";

// import PolizolSalary from "./PolizolSalary";
// import OchisleniyaSalary from "./OchisleniyaSalary";
// import RuberoidSalary from "./RuberoidSalary";
// import WorkerPaymentsTable from "./Bitum3";
// import Bonus from "../bonus/Bonus";
// import { useGetBonusesQuery } from "../../context/bonusApi";

// function Salary() {
//   const { data } = useGetAllSalaryQuery();
//   const { data: dataBTM3 } = useGetSalaryBTM3Query();
//   const { data: dataBonus } = useGetBonusesQuery();

//   let OchisleniyaData = data?.filter(
//     (record) => record.department === "ochisleniya"
//   );

//   let PolizolData = data?.filter((record) => record.department === "polizol");

//   let RuberoidData = data?.filter((record) => record.department === "ruberoid");

//   return (
//     <div style={{ padding: "0 15px" }}>
//       <Tabs>
//         <Tabs.TabPane tab="Polizol" key="1">
//           <PolizolSalary data={PolizolData} />
//         </Tabs.TabPane>

//         <Tabs.TabPane tab="Okisleniya" key="2">
//           <OchisleniyaSalary data={OchisleniyaData} />
//         </Tabs.TabPane>

//         <Tabs.TabPane tab="Ruberoid" key="3">
//           <RuberoidSalary data={RuberoidData} />
//         </Tabs.TabPane>

//         <Tabs.TabPane tab="Bitum-3M" key="4">
//           <WorkerPaymentsTable data={dataBTM3} />
//         </Tabs.TabPane>
//         <Tabs.TabPane tab="Bonuslar" key="5">
//           <Bonus data={dataBonus?.innerData || []} />
//         </Tabs.TabPane>
//       </Tabs>
//     </div>
//   );
// }

// export default Salary;

import React, { useState } from "react";
import { Tabs, DatePicker } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import {
  useGetAllSalaryQuery,
  useGetSalaryBTM3Query,
} from "../../context/salaryApi";
import { useGetBonusesQuery } from "../../context/bonusApi";

import PolizolSalary from "./PolizolSalary";
import OchisleniyaSalary from "./OchisleniyaSalary";
import RuberoidSalary from "./RuberoidSalary";
import WorkerPaymentsTable from "./Bitum3";
import Bonus from "../bonus/Bonus";

import "./Salary.css";
import { skipToken } from "@reduxjs/toolkit/query/react";

const { RangePicker } = DatePicker;

function Salary() {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  const startDate = dateRange?.[0]
    ? dateRange[0].startOf("day").toISOString()
    : undefined;

  const endDate = dateRange?.[1]
    ? dateRange[1].endOf("day").toISOString()
    : undefined;

  const noDates = !startDate || !endDate;

  const salaryQ = useGetAllSalaryQuery(
    noDates ? skipToken : { startDate, endDate }
  );
  const btm3Q = useGetSalaryBTM3Query(
    noDates ? skipToken : { startDate, endDate }
  );
  const bonusQ = useGetBonusesQuery(
    noDates ? skipToken : { startDate, endDate }
  );

  // 404 bo'lsa => bo'sh; aks holda currentData (yangi) yoki data (kesh)
  const safeData = (q) =>
    q.isError && q.error?.status === 404 ? [] : q.currentData ?? q.data ?? [];

  // Asosiy kolleksiyalar
  const allSalary = safeData(salaryQ);
  const dataBTM3 = safeData(btm3Q);
  const bonuses = safeData(bonusQ);

  // Filtrlab tabs'ga beramiz
  const OchisleniyaData = allSalary.filter(
    (r) => r.department === "Okisleniya"
  );
  const PolizolData = allSalary.filter((r) => r.department === "polizol");
  const RuberoidData = allSalary.filter((r) => r.department === "ruberoid");

  // Bonuslarda siz ilgari innerData ishlatgansiz; agar server to'g'ridan-to'g'ri massiv qaytarsa:
  const BonusData = Array.isArray(bonuses?.innerData)
    ? bonuses.innerData
    : bonuses;

  return (
    <div style={{ padding: "0 15px" }}>
      {/* Sana oralig'i tanlash */}
      <div style={{ marginBottom: "15px" }}>
        <RangePicker
          value={dateRange}
          onChange={(values) =>
            setDateRange(
              values || [dayjs().startOf("month"), dayjs().endOf("month")]
            )
          }
        />
      </div>

      <Tabs>
        <Tabs.TabPane tab="Polizol" key="1">
          <PolizolSalary data={PolizolData} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Okisleniya" key="2">
          <OchisleniyaSalary data={OchisleniyaData} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Ruberoid" key="3">
          <RuberoidSalary data={RuberoidData} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Bitum-3M" key="4">
          <WorkerPaymentsTable data={dataBTM3} />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Bonuslar" key="5">
          <Bonus data={BonusData} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Salary;
