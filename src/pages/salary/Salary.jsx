import React from "react";
import { Card, Tabs } from "antd";
import { useGetAllSalaryQuery } from "../../context/salaryApi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import "./Salary.css";

import PolizolSalary from "./PolizolSalary";
import OchisleniyaSalary from "./OchisleniyaSalary";

function Salary() {
  const { data } = useGetAllSalaryQuery();

  let OchisleniyaData = data?.filter(
    (record) => record.department === "ochisleniya"
  );

  let PolizolData = data?.filter((record) => record.department === "polizol");

  return (
    <Tabs>
      <Tabs.TabPane tab="Polizol" key="1">
        <PolizolSalary data={PolizolData} />
      </Tabs.TabPane>

      <Tabs.TabPane tab="Ochisleniya" key="2">
        <OchisleniyaSalary data={OchisleniyaData} />
      </Tabs.TabPane>
    </Tabs>
  );
}

export default Salary;
