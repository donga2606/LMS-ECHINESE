import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { areaApi, branchApi, teacherApi } from "~/apiBase";
import SortBox from "~/components/Elements/SortBox";
import PowerTable from "~/components/PowerTable";
import FilterColumn from "~/components/Tables/FilterColumn";
import { useWrap } from "~/context/wrap";
import TeacherDelete from "./TeacherDelete";
import TeacherFilterForm from "./TeacherFilterForm";
import TeacherForm from "./TeacherForm";
import { Tooltip } from "antd";
import Link from "next/link";
import { Info } from "react-feather";

const Teacher = () => {
  const [teacherList, setTeacherList] = useState<ITeacher[]>([]);
  const [areaList, setAreaList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [loadingFetchBranch, setLoadingFetchBranch] = useState(false);
  const [isLoading, setIsLoading] = useState({
    type: "",
    status: false,
  });
  const [totalPage, setTotalPage] = useState(null);
  const { showNoti } = useWrap();
  // FILTER
  const listFieldInit = {
    pageIndex: 1,
    pageSize: 10,
    sort: -1,
    sortType: false,
    AreaID: "",
    FullNameUnicode: "",
    fromDate: "",
    toDate: "",
  };
  let refValue = useRef({
    pageIndex: 1,
    pageSize: 10,
    sort: -1,
    sortType: false,
  });
  const [filters, setFilters] = useState(listFieldInit);
  // SORT OPTION
  const sortOptionList = [
    {
      dataSort: {
        sort: 0,
        sortType: true,
      },
      value: 1,
      text: "Tên tăng dần",
    },
    {
      dataSort: {
        sort: 0,
        sortType: false,
      },
      value: 2,
      text: "Tên giảm dần",
    },
    {
      dataSort: {
        sort: 2,
        sortType: true,
      },
      value: 3,
      text: "Ngày nhận việc tăng dần",
    },
    {
      dataSort: {
        sort: 2,
        sortType: false,
      },
      value: 4,
      text: "Ngày nhận việc giảm dần",
    },
  ];
  // FILTER
  const onFilterTeacherJobDate = (obj) => {
    setFilters({
      ...listFieldInit,
      ...refValue.current,
      pageIndex: 1,
      fromDate: moment(obj.fromDate).format("YYYY/MM/DD"),
      toDate: moment(obj.toDate).format("YYYY/MM/DD"),
    });
  };
  // PAGINATION
  const getPagination = (pageIndex: number, pageSize: number) => {
    if (!pageSize) pageSize = 10;
    refValue.current = {
      ...refValue.current,
      pageSize,
      pageIndex,
    };
    setFilters({
      ...filters,
      ...refValue.current,
    });
  };
  // SORT
  const onSort = (option) => {
    refValue.current = {
      ...refValue.current,
      sort: option.title.sort,
      sortType: option.title.sortType,
    };
    setFilters({
      ...listFieldInit,
      ...refValue.current,
    });
  };
  // RESET SEARCH
  const onResetSearch = () => {
    setFilters({
      ...listFieldInit,
      pageSize: refValue.current.pageSize,
    });
  };
  // ACTION SEARCH
  const onSearch = (valueSearch, dataIndex) => {
    setFilters({
      ...listFieldInit,
      ...refValue.current,
      pageIndex: 1,
      [dataIndex]: valueSearch,
    });
  };
  // GET AREA
  const fetchAreaList = async () => {
    try {
      let res = await areaApi.getAll({
        selectAll: true,
      });
      if (res.status === 200 && res.data.totalRow && res.data.data.length) {
        const newAreaList = res.data.data.map((x) => ({
          title: x.AreaName,
          value: x.AreaID,
        }));
        setAreaList(newAreaList);
      }
    } catch (error) {
      showNoti("danger", error.message);
    }
  };
  useEffect(() => {
    fetchAreaList();
  }, []);
  // BRANCH BY AREA
  const fetchBranchByAreaId = async (id: number) => {
    setLoadingFetchBranch(true);
    try {
      let res = await branchApi.getAll({
        areaID: id,
      });
      if (res.status === 200 && res.data.totalRow) {
        const newBranchList = res.data.data.map((x) => ({
          title: x.BranchName,
          value: `${x.ID}-${x.BranchName}`,
        }));
        setBranchList(newBranchList);
      }
      if (res.status === 204) {
        setBranchList([]);
      }
    } catch (error) {
      showNoti("danger", error.message);
    } finally {
      setLoadingFetchBranch(false);
    }
  };
  // GET DATA IN FIRST TIME
  const fetchTeacherList = async () => {
    setIsLoading({
      type: "GET_ALL",
      status: true,
    });
    try {
      let res = await teacherApi.getAll(filters);
      if (res.status === 200) {
        if (res.data.totalRow && res.data.data.length) {
          setTeacherList(res.data.data);
          setTotalPage(res.data.totalRow);
        }
      } else if (res.status === 204) {
        setFilters({
          ...listFieldInit,
          ...refValue.current,
        });
        showNoti("danger", "Không tìm thấy");
      }
    } catch (error) {
      showNoti("danger", error.message);
    } finally {
      setIsLoading({
        type: "GET_ALL",
        status: false,
      });
    }
  };
  useEffect(() => {
    fetchTeacherList();
  }, [filters]);

  // CREATE
  const onCreateTeacher = async (data: any) => {
    setIsLoading({
      type: "ADD_DATA",
      status: true,
    });
    let res;
    try {
      const newTeacher = {
        ...data,
        Branch: data.Branch.map((b) => b.slice(0, b.indexOf("-"))).join(","),
      };
      res = await teacherApi.add(newTeacher);
      res.status === 200 && showNoti("success", res.data.message);
      onResetSearch(); // <== khi tạo xong r reset search để trở về trang đầu tiên
    } catch (error) {
      showNoti("danger", error.message);
    } finally {
      setIsLoading({
        type: "ADD_DATA",
        status: false,
      });
    }
    return res;
  };
  // UPDATE
  const onUpdateTeacher = async (newObj: any, idx: number) => {
    setIsLoading({
      type: "ADD_DATA",
      status: true,
    });
    let res;
    try {
      const newTeacher = {
        ...newObj,
        Branch: newObj.Branch.map((b) => b.slice(0, b.indexOf("-"))).join(","),
      };
      res = await teacherApi.update(newTeacher);
      if (res.status === 200) {
        const newDayOffList = [...teacherList];
        newDayOffList.splice(idx, 1, {
          ...newObj,
          AreaName: areaList.find((a) => a.value === newObj.AreaID).title,
          Branch: newObj.Branch.join(","),
        });
        setTeacherList(newDayOffList);
        showNoti("success", res.data.message);
      }
    } catch (error) {
      showNoti("danger", error.message);
    } finally {
      setIsLoading({
        type: "ADD_DATA",
        status: false,
      });
      return res;
    }
  };
  // DELETE
  const onDeleteTeacher = async (idx: number) => {
    setIsLoading({
      type: "GET_ALL",
      status: true,
    });
    try {
      const delObj = teacherList[idx];
      const res = await teacherApi.delete({
        ...delObj,
        Enable: false,
      });
      res.status === 200 && showNoti("success", res.data.message);
      if (teacherList.length === 1) {
        filters.pageIndex === 1
          ? setFilters({
              ...listFieldInit,
              ...refValue.current,
              pageIndex: 1,
            })
          : setFilters({
              ...filters,
              ...refValue.current,
              pageIndex: filters.pageIndex - 1,
            });
        return;
      }
      fetchTeacherList();
    } catch (error) {
      showNoti("danger", error.message);
    } finally {
      setIsLoading({
        type: "GET_ALL",
        status: false,
      });
    }
  };

  const columns = [
    {
      title: "Tỉnh/Thành phố",
      dataIndex: "AreaName",
      ...FilterColumn("AreaID", onSearch, onResetSearch, "select", areaList),
    },
    {
      title: "Họ và tên",
      dataIndex: "FullNameUnicode",
      ...FilterColumn("FullNameUnicode", onSearch, onResetSearch, "text"),
      render: (text) => <p className="font-weight-blue">{text}</p>,
    },
    {
      title: "SĐT",
      dataIndex: "Mobile",
    },
    {
      title: "Email",
      dataIndex: "Email",
      render: (text) => <p className="font-weight-black">{text}</p>,
    },
    {
      title: "Ngày nhận việc",
      dataIndex: "Jobdate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "StatusID",
      align: "center",
      filters: [
        {
          text: "Active",
          value: 0,
        },
        {
          text: "Inactive",
          value: 2,
        },
      ],
      onFilter: (value, record) => record.StatusID === value,
      render: (status) =>
        status ? (
          <span className="tag gray">Inactive</span>
        ) : (
          <span className="tag green">Active</span>
        ),
    },

    {
      align: "center",
      render: (value, _, idx) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Link
            href={{
              pathname: "/staff/teacher-list/teacher-detail/[slug]",
              query: { slug: 2 },
            }}
          >
            <Tooltip title="Xem phòng">
              <button className="btn btn-icon">
                <Info />
              </button>
            </Tooltip>
            {/* <a className="btn btn-icon">
							<Tooltip title="Chi tiết">
								<Eye />
							</Tooltip>
						</a> */}
          </Link>
          <TeacherForm
            isLoading={isLoading}
            isUpdate={true}
            updateObj={value}
            indexUpdateObj={idx}
            handleUpdateTeacher={onUpdateTeacher}
            //
            optionAreaList={areaList}
            optionBranchList={branchList}
            handleFetchBranch={fetchBranchByAreaId}
            loadingFetchBranch={loadingFetchBranch}
          />
          <TeacherDelete handleDeleteTeacher={onDeleteTeacher} index={idx} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PowerTable
        currentPage={filters.pageIndex}
        totalPage={totalPage}
        getPagination={getPagination}
        loading={isLoading}
        addClass="basic-header"
        columns={columns}
        dataSource={teacherList}
        TitlePage="Danh sách giáo viên"
        // TitleCard={<ModalAdd />}
        TitleCard={
          <TeacherForm
            isLoading={isLoading}
            optionAreaList={areaList}
            optionBranchList={branchList}
            handleCreateTeacher={onCreateTeacher}
            handleFetchBranch={fetchBranchByAreaId}
            loadingFetchBranch={loadingFetchBranch}
          />
        }
        Extra={
          <div className="extra-table">
            <TeacherFilterForm
              handleFilterTeacherJobDate={onFilterTeacherJobDate}
            />
            <SortBox handleSort={onSort} dataOption={sortOptionList} />
          </div>
        }
      />
    </>
  );
};

export default Teacher;