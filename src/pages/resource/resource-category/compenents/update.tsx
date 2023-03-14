import React, { useState, useRef, useEffect } from "react";
import { Modal, Form, Input, Cascader, message } from "antd";
import styles from "./create.module.less";
import { resourceCategory } from "../../../../api/index";
import type { FormInstance } from "antd/es/form";

interface PropInterface {
  id: number;
  open: boolean;
  onCancel: () => void;
}

interface Option {
  value: string | number;
  label: string;
  children?: Option[];
}

export const ResourceCategoryUpdate: React.FC<PropInterface> = ({
  id,
  open,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<any>([]);
  const [parent_id, setParentId] = useState<number>(0);

  useEffect(() => {
    getParams();
  }, []);

  useEffect(() => {
    if (id === 0) {
      return;
    }
    getDetail();
  }, [id]);

  useEffect(() => {
    form.setFieldsValue({
      name: "",
      parent_id: [0],
    });
  }, [form, open]);

  const getParams = () => {
    resourceCategory.createResourceCategory().then((res: any) => {
      const categories = res.data.categories;
      if (JSON.stringify(categories) !== "{}") {
        const new_arr: Option[] = checkArr(categories, 0);
        new_arr.unshift({
          label: "无",
          value: 0,
        });
        setCategories(new_arr);
      }
    });
  };

  const getDetail = () => {
    resourceCategory.resourceCategory(id).then((res: any) => {
      let data = res.data;
      let arr = data.parent_chain.split(",");
      let new_arr: any[] = [];
      arr.map((num: any) => {
        new_arr.push(Number(num));
      });
      form.setFieldsValue({
        name: data.name,
        sort: data.sort,
        parent_id: new_arr,
      });
      setParentId(data.parent_id);
    });
  };

  const checkArr = (categories: any[], id: number) => {
    const arr = [];
    for (let i = 0; i < categories[id].length; i++) {
      if (!categories[categories[id][i].id]) {
        arr.push({
          label: categories[id][i].name,
          value: categories[id][i].id,
        });
      } else {
        const new_arr: Option[] = checkArr(categories, categories[id][i].id);
        arr.push({
          label: categories[id][i].name,
          value: categories[id][i].id,
          children: new_arr,
        });
      }
    }
    return arr;
  };

  const onFinish = (values: any) => {
    resourceCategory
      .updateResourceCategory(id, values.name, parent_id || 0, values.sort)
      .then((res: any) => {
        message.success("保存成功！");
        onCancel();
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const handleChange = (value: any) => {
    if (value !== undefined) {
      let it = value[value.length - 1];
      if (it === id) {
        setParentId(0);
      } else {
        setParentId(it);
      }
    } else {
      setParentId(0);
    }
  };

  const displayRender = (label: any, selectedOptions: any) => {
    return label[label.length - 1];
  };

  return (
    <>
      <Modal
        title="新建分类"
        centered
        forceRender
        open={open}
        width={416}
        onOk={() => form.submit()}
        onCancel={() => onCancel()}
      >
        <div className="float-left mt-24">
          <Form
            form={form}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="所属上级"
              name="parent_id"
              rules={[{ required: true, message: "请选择所属上级!" }]}
            >
              <Cascader
                style={{ width: 200 }}
                allowClear
                placeholder="请选择所属上级"
                onChange={handleChange}
                options={categories}
                changeOnSelect
                expand-trigger="hover"
                displayRender={displayRender}
              />
            </Form.Item>
            <Form.Item
              label="分类名称"
              name="name"
              rules={[{ required: true, message: "请输入分类名称!" }]}
            >
              <Input style={{ width: 200 }} placeholder="请输入分类名称" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};