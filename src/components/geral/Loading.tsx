import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.49)',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            {/* Removido o atributo 'spin' que estava causando o erro */}
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
        </div>
    );
}