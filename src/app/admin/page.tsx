import { redirect } from 'next/navigation'
import { checkRole } from '../utils/roles'
import { SearchUsers } from './SearchUsers'
import { clerkClient } from '@clerk/nextjs/server'
import { setRole, removeRole } from './_actions'
import classNames from 'classnames'

export default async function AdminDashboard(params: {
    searchParams: Promise<{ search?: string }>
}) {
    if (!checkRole('admin')) {
        redirect('/')
    }

    const query = (await params.searchParams).search

    const client = await clerkClient()

    const users = query ? (await client.users.getUserList({ query })).data : []

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <p className="text-lg font-semibold text-gray-700 mb-4">
                This is the protected admin dashboard restricted to users with the `admin` role.
            </p>

            <div className="mb-6">
                <SearchUsers />
            </div>

            <div className="space-y-4">
                {users.map((user) => {
                    return (
                        <div key={user.id} className="p-4 bg-white shadow rounded-md">
                            <div className="text-lg font-medium text-gray-800">
                                {user.firstName} {user.lastName}
                            </div>

                            <div className="text-sm text-gray-600">
                                {
                                    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
                                        ?.emailAddress
                                }
                            </div>

                            <div className="text-sm text-gray-500 mt-2">
                                {user.publicMetadata.role as string}
                            </div>

                            <div className="mt-4 space-y-2">
                                <form action={setRole} className="flex items-center space-x-2">
                                    <input type="hidden" value={user.id} name="id" />
                                    <input type="hidden" value="admin" name="role" />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Make Admin
                                    </button>
                                </form>

                                <form action={setRole} className="flex items-center space-x-2">
                                    <input type="hidden" value={user.id} name="id" />
                                    <input type="hidden" value="moderator" name="role" />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Make Moderator
                                    </button>
                                </form>

                                <form action={removeRole} className="flex items-center space-x-2">
                                    <input type="hidden" value={user.id} name="id" />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Remove Role
                                    </button>
                                </form>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}