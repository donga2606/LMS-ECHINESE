import {Button, Popover, Spin} from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {Calendar, momentLocalizer} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {useWrap} from '~/context/wrap';
import CourseDetailUploadFile from './CourseDetailUploadFile';
moment.locale('vi');
const localizer = momentLocalizer(moment);

CDCalendar.propTypes = {
	isLoading: PropTypes.shape({
		type: PropTypes.string.isRequired,
		status: PropTypes.bool.isRequired,
	}),
	eventList: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number.isRequired,
			title: PropTypes.string.isRequired,
			start: PropTypes.instanceOf(Date).isRequired,
			end: PropTypes.instanceOf(Date).isRequired,
			resource: PropTypes.object,
		})
	).isRequired,
	isLoaded: PropTypes.bool,
	//
	isUploadDocument: PropTypes.bool,
	handleUploadDocument: PropTypes.func,
	//
	isStudyZoom: PropTypes.bool,
	fetchStudyZoom: PropTypes.func,
	handleStudyZoom: PropTypes.func,
	handleEndStudyZoom: PropTypes.func,
};
CDCalendar.defaultProps = {
	isLoading: {type: '', status: false},
	eventList: [],
	isLoaded: false,
	//
	isUploadDocument: false,
	handleUploadDocument: null,
	//
	isStudyZoom: false,
	fetchStudyZoom: null,
	handleStudyZoom: null,
	handleEndStudyZoom: null,
};
function CDCalendar(props) {
	const {
		isLoading,
		eventList,
		isLoaded,
		isUploadDocument,
		handleUploadDocument,
		//
		isStudyZoom,
		fetchStudyZoom,
		handleStudyZoom,
		handleEndStudyZoom,
	} = props;
	const [courseScheduleID, setCourseScheduleID] = useState(0);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const openModal = () => setIsModalVisible(true);
	const closeModal = () => setIsModalVisible(false);
	const {userInformation} = useWrap();
	const middlewareUploadImage = (ID) => {
		setCourseScheduleID(+ID);
		openModal();
	};

	const checkFetchStudyZoom = (date) => {
		if (!fetchStudyZoom) return;
		fetchStudyZoom(date);
	};

	const checkHandleStudyZoom = (data: {
		idx: number;
		btnID: number;
		btnName: string;
		scheduleID: number;
	}) => {
		if (!handleStudyZoom) return;
		handleStudyZoom(data);
	};

	const checkTypeButtonStudyZoom = (data: {
		idx: number;
		btnID: number;
		btnName: string;
		scheduleID: number;
	}) => {
		const {btnID, btnName} = data;
		if (!btnID) return;
		if (userInformation?.RoleID === 3 && btnID === 2) {
			return (
				<Button
					size="middle"
					className="mt-3 btn-success w-100"
					onClick={() => {
						checkHandleStudyZoom(data);
					}}
				>
					{btnName}
				</Button>
			);
		}
		if (userInformation?.RoleID === 2) {
			let cls;
			if (btnID === 1) {
				cls = 'mt-3 btn-warning w-100';
			}
			if (btnID === 2) {
				cls = 'mt-3 btn-success w-100';
			}
			if (btnID === 3) {
				cls = 'mt-3 btn-secondary w-100';
			}
			return (
				<Button
					size="middle"
					className={cls}
					onClick={() => {
						checkHandleStudyZoom(data);
					}}
				>
					{btnName}
				</Button>
			);
		}
	};

	const styleEvent = ({event}) => {
		const {
			ID,
			CourseID,
			RoomName,
			BranchName,
			TeacherName,
			SubjectName,
			LinkDocument,
			//
			StudyTimeName,
			// ZOOM
			ButtonID: btnID,
			ButtonName: btnName,
			idx,
		} = event.resource;
		const content = (
			<div className="course-dt-event-info">
				<ul>
					{SubjectName && (
						<li>
							<span>Môn:</span> {SubjectName}
						</li>
					)}
					{RoomName && (
						<li>
							<span>Phòng:</span> {RoomName}
						</li>
					)}
					{TeacherName && (
						<li>
							<span>GV:</span> {TeacherName}
						</li>
					)}
					{BranchName && (
						<li>
							<span>Trung tâm:</span> {BranchName}
						</li>
					)}
					{LinkDocument && (
						<li>
							<span>Tài liệu: </span>
							{LinkDocument ? (
								<a href={LinkDocument} target="_blank" download>
									<i>Click to download</i>
								</a>
							) : (
								'Trống'
							)}
						</li>
					)}
					{isUploadDocument && (
						<li>
							<Button
								size="middle"
								className="mt-3 btn-warning w-100"
								onClick={() => middlewareUploadImage(ID)}
							>
								Thêm tài liệu
							</Button>
						</li>
					)}
					{isStudyZoom && (
						<li>
							{checkTypeButtonStudyZoom({
								idx,
								btnID,
								btnName,
								scheduleID: ID,
							})}
						</li>
					)}
				</ul>
			</div>
		);
		return (
			<Popover
				zIndex={999}
				title={`Ca: ${StudyTimeName}`}
				content={content}
				placement="rightTop"
				trigger={
					window.matchMedia('(max-width: 1199px)').matches ? 'click' : 'hover'
				}
			>
				<div className="course-dt-event">
					<div className="time">Ca: {StudyTimeName}</div>
				</div>
			</Popover>
		);
	};
	const styleAgenda = ({event}) => {
		const {
			ID,
			RoomName,
			BranchName,
			TeacherName,
			SubjectName,
			LinkDocument,
			//
			StudyTimeName,
			// ZOOM
			ButtonID: btnID,
			ButtonName: btnName,
			idx,
		} = event.resource;
		return (
			<div className="course-dt-event">
				<div className="time">Ca: {StudyTimeName}</div>
				<div className="course-dt-event-info">
					<ul>
						{SubjectName && (
							<li>
								<span>Môn:</span> {SubjectName}
							</li>
						)}
						{RoomName && (
							<li>
								<span>Phòng:</span> {RoomName}
							</li>
						)}
						{TeacherName && (
							<li>
								<span>GV:</span> {TeacherName}
							</li>
						)}
						{BranchName && (
							<li>
								<span>Trung tâm:</span> {BranchName}
							</li>
						)}
						{LinkDocument && (
							<li>
								<span>Tài liệu: </span>
								{LinkDocument ? (
									<a href={LinkDocument} target="_blank" download>
										<i>Click to download</i>
									</a>
								) : (
									'Trống'
								)}
							</li>
						)}
						{isStudyZoom && (
							<li>
								{checkTypeButtonStudyZoom({
									idx,
									btnID,
									btnName,
									scheduleID: ID,
								})}
							</li>
						)}
					</ul>
				</div>
			</div>
		);
	};
	const styleDay = ({event}) => {
		const {
			ID,
			CourseID,
			RoomName,
			BranchName,
			TeacherName,
			SubjectName,
			LinkDocument,
			//
			StudyTimeName,
			// ZOOM
			ButtonID: btnID,
			ButtonName: btnName,
			idx,
		} = event.resource;
		const content = (
			<div className="course-dt-event-info">
				<ul>
					{SubjectName && (
						<li>
							<span>Môn:</span> {SubjectName}
						</li>
					)}
					{RoomName && (
						<li>
							<span>Phòng:</span> {RoomName}
						</li>
					)}
					{TeacherName && (
						<li>
							<span>GV:</span> {TeacherName}
						</li>
					)}
					{BranchName && (
						<li>
							<span>Trung tâm:</span> {BranchName}
						</li>
					)}
					{LinkDocument && (
						<li>
							<span>Tài liệu: </span>
							{LinkDocument ? (
								<a href={LinkDocument} target="_blank" download>
									<i>Click to download</i>
								</a>
							) : (
								'Trống'
							)}
						</li>
					)}
					{isUploadDocument && (
						<li>
							<Button
								size="middle"
								className="mt-3 btn-warning w-100"
								onClick={() => middlewareUploadImage(ID)}
							>
								Thêm tài liệu
							</Button>
						</li>
					)}
					{isStudyZoom && (
						<li>
							{checkTypeButtonStudyZoom({
								idx,
								btnID,
								btnName,
								scheduleID: ID,
							})}
						</li>
					)}
				</ul>
			</div>
		);
		return (
			<Popover
				zIndex={999}
				title={`Ca: ${StudyTimeName}`}
				content={content}
				placement="bottomLeft"
				trigger={
					window.matchMedia('(max-width: 1199px)').matches ? 'click' : 'hover'
				}
			>
				<div className="course-dt-event">
					<div className="time">Ca: {StudyTimeName}</div>
				</div>
			</Popover>
		);
	};

	return (
		<div className="wrap-calendar">
			<Spin
				spinning={!isLoaded}
				size="large"
				wrapperClassName="calendar-loading"
			>
				<Calendar
					className="custom-calendar"
					localizer={localizer}
					events={eventList}
					startAccessor="start"
					endAccessor="end"
					style={{minHeight: 600}}
					popup
					defaultView="month"
					showMultiDayTimes={false}
					onRangeChange={checkFetchStudyZoom}
					handleDragStart={() => null}
					formats={{
						agendaDateFormat: 'DD/MM/YYYY',
						monthHeaderFormat: (date) => moment(date).format('MM/YYYY'),
						dayHeaderFormat: (date) => {
							const dayArr = [
								'Chủ Nhật',
								'Thứ 2',
								'Thứ 3',
								'Thứ 4',
								'Thứ 5',
								'Thứ 6',
								'Thứ 7',
							];
							const dayOffWeek = dayArr[moment(date).day()];
							return `${dayOffWeek} - ${moment(date).format('DD/MM')}`;
						},
						dayRangeHeaderFormat: ({start, end}) =>
							`${moment(start).format('DD/MM')} - ${moment(end).format(
								'DD/MM'
							)}`,
					}}
					components={{
						event: styleEvent,
						day: {
							event: styleDay,
						},
						agenda: {event: styleAgenda},
					}}
					messages={{}}
				/>
			</Spin>
			{isUploadDocument && (
				<CourseDetailUploadFile
					isLoading={isLoading}
					isModalVisible={isModalVisible}
					handleCloseModal={closeModal}
					handleUploadDocument={handleUploadDocument}
					courseScheduleID={courseScheduleID}
				/>
			)}
		</div>
	);
}
export default CDCalendar;
