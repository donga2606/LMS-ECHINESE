import { Modal, Spin, Form, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import { RotateCcw, X } from 'react-feather';
import { documentCategoryApi } from '~/apiBase/course-detail/document-category';
import { useWrap } from '~/context/wrap';

const DocModal = ({ type, cateID, onFetchData, CategoryName }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [submitLoading, setSubmitLoading] = useState({ type: '', loading: false });
	const [form] = Form.useForm();
	const { showNoti, pageSize } = useWrap();

	const addDocument = async (data) => {
		setSubmitLoading({ type: 'UPLOADING', loading: true });
		try {
			let res = await documentCategoryApi.add(data);
			if (res.status === 200) {
				showNoti('success', 'Thành công!');
				setIsVisible(false);
				form.resetFields();
				onFetchData && onFetchData();
			}
		} catch (error) {
			showNoti('danger', error.message);
		} finally {
			setSubmitLoading({ type: 'UPLOADING', loading: false });
		}
	};

	const editDocument = async (data) => {
		setSubmitLoading({ type: 'UPLOADING', loading: true });
		try {
			let res = await documentCategoryApi.update(data);
			if (res.status == 200) {
				showNoti('success', 'Thành công!');
				setIsVisible(false);
				form.resetFields();
				onFetchData && onFetchData();
			}
		} catch (error) {
			showNoti('danger', error.message);
		} finally {
			setSubmitLoading({ type: 'UPLOADING', loading: false });
		}
	};

	const _onSubmit = (value) => {
		console.log(value);
		if (type == 'ADD_DOC') {
			addDocument(value);
		}
		if (type == 'EDIT_DOC') {
			editDocument({ ...value, ID: cateID });
		}
		if (type == 'DELETE_DOC') {
			console.log({ CategoryName: CategoryName, ID: cateID, Enable: false });
			editDocument({ ID: cateID, CategoryName: CategoryName, Enable: 'false' });
		}
	};

	return (
		<>
			{type == 'ADD_DOC' && (
				<button
					onClick={() => {
						setIsVisible(true);
					}}
					className="btn btn-warning"
				>
					Thêm mới
				</button>
			)}
			{type == 'EDIT_DOC' && (
				<button
					onClick={() => {
						setIsVisible(true);
						form.resetFields();
					}}
					className="btn btn-icon edit"
				>
					<RotateCcw />
				</button>
			)}
			{type == 'DELETE_DOC' && (
				<button
					onClick={() => {
						setIsVisible(true);
					}}
					className="btn btn-icon delete"
				>
					<X />
				</button>
			)}

			<Modal
				title={
					(type == 'ADD_DOC' && 'Thêm danh mục') ||
					(type == 'DELETE_DOC' && 'Xóa danh mục') ||
					(type == 'EDIT_DOC' && 'Sửa danh mục')
				}
				onCancel={() => setIsVisible(false)}
				visible={isVisible}
				footer={false}
			>
				<Form form={form} layout="vertical" onFinish={_onSubmit}>
					<div className="row">
						{(type == 'ADD_DOC' && (
							<div className="col-12">
								<Form.Item label="Tên giáo trình" name="CategoryName">
									<Input
										onChange={(event) => {}}
										name="CategoryName"
										placeholder="Tên giáo trình"
										className="style-input"
									/>
								</Form.Item>
							</div>
						)) ||
							(type == 'DELETE_DOC' && (
								<div className="col-12 justify-content-center">
									<h4 className="text-center">Bạn xác nhận muốn xóa giáo trình?</h4>
								</div>
							)) ||
							(type == 'EDIT_DOC' && (
								<div className="col-12">
									<Form.Item label="Tên giáo trình" name="CategoryName">
										<Input
											onChange={(event) => {}}
											name="CategoryName"
											placeholder="Tên giáo trình"
											className="style-input"
											defaultValue={CategoryName}
										/>
									</Form.Item>
								</div>
							))}

						<div className="col-12 mt-3 text-center">
							<button type="submit" className="btn btn-primary">
								{type == 'DELETE_DOC' ? 'Xóa' : 'Lưu'}
								{submitLoading.type == 'UPLOADING' && submitLoading.loading && <Spin className="loading-base" />}
							</button>
						</div>
					</div>
				</Form>
			</Modal>
		</>
	);
};

export default DocModal;
