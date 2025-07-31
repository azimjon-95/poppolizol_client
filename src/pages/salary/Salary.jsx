import React from "react";
import { Card, Tabs } from "antd";
import {
  useGetAllSalaryQuery,
  useGetSalaryBTM3Query,
} from "../../context/salaryApi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import "./Salary.css";

import PolizolSalary from "./PolizolSalary";
import OchisleniyaSalary from "./OchisleniyaSalary";
import RuberoidSalary from "./RuberoidSalary";
import WorkerPaymentsTable from "./Bitum3";

function Salary() {
  const { data } = useGetAllSalaryQuery();
  const { data: dataBTM3 } = useGetSalaryBTM3Query();

  let OchisleniyaData = data?.filter(
    (record) => record.department === "ochisleniya"
  );

  let PolizolData = data?.filter((record) => record.department === "polizol");

  let RuberoidData = data?.filter((record) => record.department === "ruberoid");

  return (
    <Tabs>
      <Tabs.TabPane tab="Polizol" key="1">
        <PolizolSalary data={PolizolData} />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Ochisleniya" key="2">
        <OchisleniyaSalary data={OchisleniyaData} />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Ruberoid" key="3">
        <RuberoidSalary data={RuberoidData} />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Bitum-3M" key="4">
        <WorkerPaymentsTable data={dataBTM3} />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default Salary;
