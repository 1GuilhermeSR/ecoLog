import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.49)',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
    );
}