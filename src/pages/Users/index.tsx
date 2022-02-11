import { useContext, useEffect, useState } from 'react'
import {INearProps, NearContext} from "../../services/near";

export const Users = () => {

    const { near }: { near: INearProps | null } = useContext(NearContext)

    useEffect(() => {

    }, [near])

    if (!near) return null

    return (
        <div>Users</div>
    )
}
